var Migrations = artifacts.require("./Migrations.sol");
var ProductManagement = artifacts.require("./ProductManagement.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(ProductManagement)
};
