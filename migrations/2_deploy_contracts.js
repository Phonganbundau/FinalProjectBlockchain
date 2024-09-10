
const TimeLimitedOwnership = artifacts.require("TimeLimitedOwnership");

module.exports = function(deployer) {
  deployer.deploy(TimeLimitedOwnership);
};
