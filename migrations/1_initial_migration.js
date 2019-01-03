var Migrations = artifacts.require("./Migrations.sol");
var ProductManagement = artifacts.require("./ProductManagement.sol");
var ChangeOwnership = artifacts.require("./ChangeOwnership.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(ProductManagement)
  .then(function(){
    return deployer.deploy(ChangeOwnership, ProductManagement.address);
  })
};
