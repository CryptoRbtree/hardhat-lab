const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("GLDToken", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1, account2] = await ethers.getSigners();
  
      const Token = await ethers.getContractFactory("GLDToken");
      const token = await Token.deploy(1000);
  
      return { token, owner, account1, account2};
    }
  
    describe("Token Transfer", function () {
        it("Should transfer successfully", async function () {
            const { token, owner, account1} = await loadFixture(deploy);
            await expect(token.transfer(account1.address, 1000)).to.emit(token, "Transfer");
        });
        it("Should transfer unsuccessfully", async function () {
            const { token, owner, account1} = await loadFixture(deploy);
            await expect(token.transfer(account1.address, 2000)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });
    });

    describe("Token TransferFrom", function () {
        it("Should transfer successfully", async function () {
            const { token, owner, account1, account2} = await loadFixture(deploy);
            await expect(token.connect(account1).transferFrom(owner.address, account2.address, 1000)).to.be.revertedWith("ERC20: insufficient allowance");
            await expect(token.approve(account1.address, 1000)).to.emit(token, "Approval");
            await expect(token.connect(account1).transferFrom(owner.address, account2.address, 1000)).to.emit(token, "Transfer");
            await expect(token.connect(account1).transferFrom(owner.address, account2.address, 1000)).to.be.revertedWith("ERC20: insufficient allowance");
        });
    });
  });
  