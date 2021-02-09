const Coinflip = artifacts.require("Coinflip");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(Coinflip).then(function (instance) {
    instance.fundContract({ value: web3.utils.toWei("1", "ether"), from: accounts[0] }).then(function () {
      console.log("The Contract successfully got funded with 1 ether from Contract address: " + accounts[0]);
      console.log("The Contract address is :" + Coinflip.address);
    }).catch(function (err) {
      console.log("The contract couldn't get funded " + err);
    });
  }).catch(function (err) {
    console.log("Failed to deploy ! ");
  });
};

