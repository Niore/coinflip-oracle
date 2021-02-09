// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./provableAPI.sol";

contract Coinflip is usingProvable {
    address public owner;
    uint256 public latestNumber;
    uint256 NUM_RANDOM_BYTES_REQUESTED = 1;

    mapping(bytes32 => address) query2address;
    mapping(address => uint256) betAmounts;

    constructor() public payable {
        owner = msg.sender;
        update();
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    modifier costs(uint256 cost) {
        require(msg.value >= cost);
        _;
    }

    event wonFlip(address winner, uint256 amount);
    event loseFlip(address winner, uint256 amount);
    event contractFunded(uint256 amount);
    event LogNewProvableQuery(string info);
    event betPlaced(address gambler, uint256 amount);

    uint256 public contractBalance;

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function flipCoin() public payable costs(0.01 ether) {
        require(
            address(this).balance >= msg.value * 2,
            "Balance of Contract is to small for this betting amount"
        );

        betAmounts[msg.sender] = msg.value;
        bytes32 queryId = update();
        query2address[queryId] = msg.sender;
        emit betPlaced(msg.sender, msg.value);
    }

    function fundContract() public payable onlyOwner {
        require(msg.value > 0);
        emit contractFunded(msg.value);
    }

    function withdrawl() public payable onlyOwner {
        msg.sender.transfer(address(this).balance);
    }

    function update() public payable returns (bytes32) {
        uint256 QUERY_EXECUTION_DELAY = 0; // NOTE: The datasource currently does not support delays > 0!
        uint256 GAS_FOR_CALLBACK = 200000;
        bytes32 queryId =
            provable_newRandomDSQuery(
                QUERY_EXECUTION_DELAY,
                NUM_RANDOM_BYTES_REQUESTED,
                GAS_FOR_CALLBACK
            );
        emit LogNewProvableQuery(
            "Provable query was sent, standing by for the answer..."
        );
        return queryId;
    }

    function __callback(
        bytes32 queryId,
        string memory result,
        bytes memory proof
    ) public {
        require(msg.sender == provable_cbAddress());
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(result))) % 2;
        latestNumber = randomNumber;
        resolveBet(queryId, randomNumber);
    }

    function resolveBet(bytes32 queryId, uint256 result) private {
        address player = query2address[queryId];
        uint256 betAmount = betAmounts[player];
        if (result == 0) {
            emit loseFlip(msg.sender, betAmount);
        } else {
            msg.sender.transfer(betAmount * 2);
            emit wonFlip(msg.sender, betAmount);
        }
    }
}
