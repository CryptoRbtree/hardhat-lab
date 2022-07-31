const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("GLDToken777", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1, account2] = await ethers.getSigners();

      const ERC1820 = await ethers.getContractFactory("ERC1820Registry");
      const erc1820 = await ERC1820.deploy();
  
      const Token = await ethers.getContractFactory("GLDToken777");
      const operators = [owner.address];
      const token = await Token.deploy(1000, operators, erc1820.address);
  
      const CA = await ethers.getContractFactory("ContractAccount");
      const ca = await CA.deploy();

      return { token, owner, account1, account2, erc1820, ca};
    }
  
    describe("Token Transfer", function () {
        it("Should transfer successfully", async function () {
            const { token, owner, account1} = await loadFixture(deploy);
            await expect(token.transfer(account1.address, 1000)).to.emit(token, "Transfer");
        });
        it("Should transfer unsuccessfully", async function () {
            const { token, owner, account1} = await loadFixture(deploy);
            await expect(token.transfer(account1.address, 2000)).to.be.revertedWith("ERC777: transfer amount exceeds balance");
        });
    });

    describe("Token TransferFrom", function () {
        it("Should transfer successfully", async function () {
            const { token, owner, account1, account2} = await loadFixture(deploy);
            await expect(token.connect(account1).transferFrom(owner.address, account2.address, 1000)).to.be.revertedWith("ERC777: insufficient allowance");
            await expect(token.approve(account1.address, 1000)).to.emit(token, "Approval");
            await expect(token.connect(account1).transferFrom(owner.address, account2.address, 1000)).to.emit(token, "Transfer");
            await expect(token.connect(account1).transferFrom(owner.address, account2.address, 1000)).to.be.revertedWith("ERC777: insufficient allowance");
        });
    });

    describe("Token Send to EOA", function () {
        it("Should send successfully", async function () {
            const { token, owner, account1} = await loadFixture(deploy);
            await expect(token.send(account1.address, 1000, [])).to.emit(token, "Transfer");
        });
        it("Should send unsuccessfully", async function () {
            const { token, owner, account1} = await loadFixture(deploy);
            await expect(token.send(account1.address, 2000, [])).to.be.revertedWith("ERC777: transfer amount exceeds balance");
        });
    });

    describe("Token Operator-Send to EOA", function () {
        it("Should send successfully", async function () {
            const { token, owner, account1, account2} = await loadFixture(deploy);
            await expect(token.send(account1.address, 1000, [])).to.emit(token, "Transfer");
            await expect(token.operatorSend(account1.address, account2.address, 1000, [], [])).to.emit(token, "Transfer");
        });
        it("Should send unsuccessfully", async function () {
            const { token, owner, account1, account2} = await loadFixture(deploy);
            await expect(token.send(account1.address, 500, [])).to.emit(token, "Transfer");
            await expect(token.connect(account1).revokeOperator(owner.address)).to.emit(token, "RevokedOperator");
            await expect(token.operatorSend(account1.address, account2.address, 1000, [], [])).to.be.rejectedWith("ERC777: caller is not an operator for holder");
        });
    });

    describe("Token Send to CA", function () {
        it("Should send successfully after registering", async function () {
            const { token, owner, account1, account2, erc1820, ca} = await loadFixture(deploy);
            await expect(token.send(ca.address, 1000, [])).to.be.rejectedWith("ERC777: token recipient contract has no implementer for ERC777TokensRecipient");
            await expect(ca.registerERC1820(erc1820.address)).not.to.be.reverted;
            await expect(token.send(ca.address, 1000, [])).to.emit(token, "Transfer").to.emit(ca, "TokensReceived");
        });
    });
  });
  