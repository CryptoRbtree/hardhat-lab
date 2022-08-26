const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
const { ethers } = require("hardhat");
  
  describe("PaymentSplitter", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
        // Contracts are deployed using the first signer/account by default
        const [owner, account1, account2] = await ethers.getSigners();
    
        const Splitter = await ethers.getContractFactory("PaymentSplitterTest");
        const splitter = await Splitter.deploy([owner.address, account1.address, account2.address], 
            [1, 2, 3]);

        const Token = await ethers.getContractFactory("GLDToken");
        const token = await Token.deploy(1000);
  
      return { splitter, token, owner, account1, account2 };
    }
  
    describe("PaymentSplitter", function () {
        it("split ETH", async function () {
            const { splitter, token, owner, account1, account2 } = await loadFixture(deploy);

            await expect(owner.sendTransaction({
                to: splitter.address,
                value: ethers.utils.parseEther("6.0"),
                gasLimit: 80000
            })).to.be.emit(splitter, "PaymentReceived");

            expect(await splitter["releasable(address)"](owner.address)).to.equal(ethers.utils.parseEther("1.0"));

            await expect(splitter.connect(account1)["release(address)"](owner.address)).to.be.emit(splitter, "PaymentReleased").withArgs(owner.address, ethers.utils.parseEther("1.0"));
            await expect(splitter["release(address)"](owner.address)).to.be.revertedWith("PaymentSplitter: account is not due payment");
            await expect(splitter["release(address)"](account1.address)).to.be.emit(splitter, "PaymentReleased").withArgs(account1.address, ethers.utils.parseEther("2.0"));
            await expect(splitter["release(address)"](account2.address)).to.be.emit(splitter, "PaymentReleased").withArgs(account2.address, ethers.utils.parseEther("3.0"));
        });

        it("split token", async function () {
            const { splitter, token, owner, account1, account2 } = await loadFixture(deploy);

            await expect(token.transfer(splitter.address, 600)).to.be.emit(token, "Transfer");

            expect(await splitter["releasable(address,address)"](token.address, owner.address)).to.equal(100);

            await expect(splitter.connect(account1)["release(address,address)"](token.address, owner.address)).to.be.emit(splitter, "ERC20PaymentReleased").withArgs(token.address, owner.address, 100);
            await expect(splitter["release(address,address)"](token.address, owner.address)).to.be.revertedWith("PaymentSplitter: account is not due payment");
            await expect(splitter["release(address,address)"](token.address, account1.address)).to.be.emit(splitter, "ERC20PaymentReleased").withArgs(token.address, account1.address, 200);
            await expect(splitter["release(address,address)"](token.address, account2.address)).to.be.emit(splitter, "ERC20PaymentReleased").withArgs(token.address, account2.address, 300);
        });
    });
  });
  