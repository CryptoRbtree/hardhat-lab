const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("MyWrapGovernanceToken", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1, account2] = await ethers.getSigners();
  
      const GLDToken = await ethers.getContractFactory("GLDToken");
      const gldtoken = await GLDToken.deploy(1000);

      const Token = await ethers.getContractFactory("MyWrapGovernToken");
      const token = await Token.deploy(gldtoken.address);
  
      return { token, owner, account1, account2, gldtoken};
    }

    async function mineNBlocks(n) {
        for (let index = 0; index < n; index++) {
          await ethers.provider.send('evm_mine');
        }
    }
  
    describe("delegate and get votes", function () {
        it("get votes", async function () {
            const { token, owner, account1, account2, gldtoken} = await loadFixture(deploy);
            expect(await gldtoken.approve(token.address, 1000)).to.emit(gldtoken, "Approval");
            expect(await token.depositFor(owner.address, 1000)).to.emit(gldtoken, "Transfer");

            expect(await token.getVotes(owner.address)).to.equal(0);
            expect(await token.getVotes(account1.address)).to.equal(0);
            await expect(token.delegate(account1.address)).to.emit(token, "DelegateChanged");
            expect(await token.getVotes(owner.address)).to.equal(0);
            expect(await token.getVotes(account1.address)).to.equal(1000);
        });
    });

    describe("delegate, transfer and get votes", function () {
        it("get votes", async function () {
            const { token, owner, account1, account2, gldtoken} = await loadFixture(deploy);
            expect(await gldtoken.approve(token.address, 1000)).to.emit(gldtoken, "Approval");
            expect(await token.depositFor(owner.address, 1000)).to.emit(gldtoken, "Transfer");

            expect(await token.getVotes(owner.address)).to.equal(0);
            expect(await token.getVotes(account1.address)).to.equal(0);

            await expect(token.delegate(account1.address)).to.emit(token, "DelegateChanged");
            expect(await token.getVotes(owner.address)).to.equal(0);
            expect(await token.getVotes(account1.address)).to.equal(1000);

            await expect(token.transfer(account2.address, 500)).to.emit(token, "Transfer").to.emit(token, "DelegateVotesChanged");
            expect(await token.getVotes(owner.address)).to.equal(0);
            expect(await token.getVotes(account1.address)).to.equal(500);
            expect(await token.getVotes(account2.address)).to.equal(0);

            await expect(token.connect(account2).delegate(account2.address)).to.emit(token, "DelegateChanged");
            expect(await token.getVotes(account2.address)).to.equal(500);
        });
    });

    describe("delegate and get past votes", function () {
        it("get votes", async function () {
            const { token, owner, account1, account2, gldtoken} = await loadFixture(deploy);
            expect(await gldtoken.approve(token.address, 1000)).to.emit(gldtoken, "Approval");
            expect(await token.depositFor(owner.address, 1000)).to.emit(gldtoken, "Transfer");

            const blockNumBefore = await ethers.provider.getBlockNumber();
            await expect(token.delegate(account1.address)).to.emit(token, "DelegateChanged");
            await mineNBlocks(1);
            expect(await token.getVotes(owner.address)).to.equal(0);
            expect(await token.getVotes(account1.address)).to.equal(1000);

            expect(await token.getPastVotes(owner.address, blockNumBefore)).to.equal(0);
            expect(await token.getPastVotes(account1.address, blockNumBefore)).to.equal(0);
            const blockNumAfter = await ethers.provider.getBlockNumber();
            expect(await token.getPastVotes(owner.address, blockNumAfter - 1)).to.equal(0);
            expect(await token.getPastVotes(account1.address, blockNumAfter - 1)).to.equal(1000);
        });
    });

    describe("delegate and get past total supply", function () {
        it("get votes", async function () {
            const { token, owner, account1, account2, gldtoken} = await loadFixture(deploy);
            expect(await gldtoken.approve(token.address, 1000)).to.emit(gldtoken, "Approval");
            expect(await token.depositFor(owner.address, 1000)).to.emit(gldtoken, "Transfer");

            const blockNum1 = await ethers.provider.getBlockNumber();
            await mineNBlocks(1);
            await expect(token.delegate(account1.address)).to.emit(token, "DelegateChanged");
            const blockNum2 = await ethers.provider.getBlockNumber();

            expect(await token.getPastTotalSupply(blockNum1)).to.equal(1000);
            expect(await token.getPastTotalSupply(blockNum2 - 1)).to.equal(1000);
        });
    });
  });
  