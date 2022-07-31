const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("UpgradeableToken", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1] = await ethers.getSigners();

      const Token = await ethers.getContractFactory("UpgradeableToken");
      const TokenV2 = await ethers.getContractFactory("UpgradeableTokenV2");
      const token = await upgrades.deployProxy(Token, ["Gold", "GLD", 1000], {
        initializer: "initialize"
      });
  
      return { token, owner, account1, TokenV2};
    }
  
    describe("Token Transfer and upgrade", function () {
        it("Should transfer successfully", async function () {
            const { token, owner, account1, TokenV2} = await loadFixture(deploy);
            await expect(token.transfer(account1.address, 500)).to.emit(token, "Transfer");
            expect(await token.balanceOf(owner.address)).to.equal(500);
            expect(await token.balanceOf(account1.address)).to.equal(500);
            expect(await token.getVersion()).to.equal("V1");

            const tokenV2 = await upgrades.upgradeProxy(token, TokenV2);
            expect(await tokenV2.balanceOf(owner.address)).to.equal(500);
            expect(await tokenV2.balanceOf(account1.address)).to.equal(500);
            expect(await tokenV2.getVersion()).to.equal("V2");
            expect(await token.getVersion()).to.equal("V2");
        });
    });

  });
  