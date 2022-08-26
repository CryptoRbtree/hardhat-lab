const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
const { ethers } = require("hardhat");
  
  describe("VestingWallet", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
        // Contracts are deployed using the first signer/account by default
        const [owner, account1] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("GLDToken");
        const token = await Token.deploy(1000000000000);

        const blockNum = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const timestamp = block.timestamp;
        const Vest = await ethers.getContractFactory("VestingWalletTest");
        const vest = await Vest.deploy(account1.address, timestamp, timestamp + 5);
  
      return { vest, token, owner, account1 };
    }

    async function mineNBlocks(n) {
        for (let index = 0; index < n; index++) {
          await ethers.provider.send('evm_mine');
        }
    }
  
    describe("VestingWallet", function () {
        it("Vest ETH", async function () {
            const { vest, token, owner, account1 } = await loadFixture(deploy);

            await owner.sendTransaction({
                to: vest.address,
                value: ethers.utils.parseEther("6.0"),
                gasLimit: 80000
            });

            const blockNum = await ethers.provider.getBlockNumber();
            const block = await ethers.provider.getBlock(blockNum);
            const timestamp = block.timestamp;

            const vestedAmount = await vest["vestedAmount(uint64)"](timestamp);
            //console.log("vestedAmount = ", vestedAmount);
            expect(vestedAmount).to.greaterThan(ethers.utils.parseEther("0.0"));
            expect(vestedAmount).to.lessThan(ethers.utils.parseEther("6.0"));

            const ethBefore = await ethers.provider.getBalance(account1.address);
            await expect(vest["release()"]()).to.be.emit(vest, "EtherReleased");
            const ethAfter = await ethers.provider.getBalance(account1.address);
            expect(ethBefore).to.lessThan(ethAfter);
        });

        it("Vest token", async function () {
            const { vest, token, owner, account1 } = await loadFixture(deploy);

            await expect(token.transfer(vest.address, 1000000000000)).to.be.emit(token, "Transfer");

            const blockNum = await ethers.provider.getBlockNumber();
            const block = await ethers.provider.getBlock(blockNum);
            const timestamp = block.timestamp;

            const vestedAmount = await vest["vestedAmount(address,uint64)"](token.address, timestamp);
            //console.log("vestedAmount = ", vestedAmount);
            expect(vestedAmount).to.greaterThan(0);
            expect(vestedAmount).to.lessThan(1000000000000);

            const tokenBefore = await token.balanceOf(account1.address);
            await expect(vest["release(address)"](token.address)).to.be.emit(vest, "ERC20Released");
            const tokenAfter = await token.balanceOf(account1.address);
            expect(tokenBefore).to.lessThan(tokenAfter);        
        });
    });
  });
  