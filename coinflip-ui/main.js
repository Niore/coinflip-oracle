var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var users;
var contract = "0x08e0dfB7f3b2F502aeAB45686B34F4a5F385e3a0";

$(document).ready(function () {
  window.ethereum.enable().then(function (accounts) {
    users = accounts;
    contractInstance = new web3.eth.Contract(abi, contract, { from: accounts[0] });

    contractInstance.events.contractFunded((err, ev) => {
      contractInstance.methods.getBalance().call().then(function (res) {
        $("#contractBalance").html(web3.utils.fromWei(res, "ether"));
      })
    });
    contractInstance.events.wonFlip((err, ev) => {
      $("#resultText").html("Won");
      $("#result").removeClass("blink-lost");
      $("#result").addClass("blink-won");
      $("#result").removeClass("blink-pending");
    });
    contractInstance.events.loseFlip((err, ev) => {
      $("#resultText").html("Lost");
      $("#result").addClass("blink-lost");
      $("#result").removeClass("blink-won");
      $("#result").removeClass("blink-pending");
    });


    contractInstance.events.LogNewProvableQuery((err, ev) => {
      $("#result").addClass("blink-pending");
      $("#resultText").html("Waiting for Oracle to resolve");
    });
  });


  $("#refresh").click(() => {
    contractInstance.methods.getBalance().call().then(function (res) {
      $("#contractBalance").html(web3.utils.fromWei(res, "ether"));
    })
  });


  $("#deposit").click(() => {
    contractInstance.methods.fundContract().send({
      value: web3.utils.toWei($("#funds").val(), 'ether')
    });
  });

  $("#play").click(() => {
    $("#result").removeClass("blink-won");
    $("#result").removeClass("blink-lost");
    $("#result").addClass("blink-pending");
    $("#resultText").html("Waiting for Oracle to resolve");
    contractInstance.methods.flipCoin().send({
      value: web3.utils.toWei($("#bet").val(), 'ether')
    }).on("transactionHash", function (hash) {
      console.log(hash);
    }).on("confirmation", function (confirmationNr) {
      console.log(confirmationNr);
    });
  });

  $("#withdrawl").click(() => {
    contractInstance.methods.withdrawl().send().then(function (res) {
      alert("Withdrawl");
    })
  });

});