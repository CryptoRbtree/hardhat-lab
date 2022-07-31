const { expect } = require("chai");

describe("Box", function() {
  it('works', async () => {
    const Box = await ethers.getContractFactory("Box");
    const BoxV2 = await ethers.getContractFactory("BoxV2");

    const instance = await upgrades.deployProxy(Box, [42], {
      initializer: "initialize"
    });
    const upgraded = await upgrades.upgradeProxy(instance.address, BoxV2);

    const value = await upgraded.val();
    expect(value.toString()).to.equal('42');

    await upgraded.inc();
    expect((await instance.val()).toString()).to.equal('43');
    expect((await upgraded.val()).toString()).to.equal('43');
  });
});