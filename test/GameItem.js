const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("GameItem", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1, account2] = await ethers.getSigners();
  
      const Game = await ethers.getContractFactory("GameItem");
      const game = await Game.deploy();

      const CA = await ethers.getContractFactory("ContractAccount");
      const ca = await CA.deploy();
  
      return { game, owner, account1, account2, ca};
    }
  
    describe("GameItem TransferFrom(From self)", function () {
        it("Should transfer successfully", async function () {
            const { game, owner, account1} = await loadFixture(deploy);
            game.awardItem(owner.address, "aaa0");
            game.awardItem(owner.address, "aaa1");
            await expect(game.transferFrom(owner.address, account1.address, 0)).to.emit(game, "Transfer");
            await expect(game.transferFrom(owner.address, account1.address, 1)).to.emit(game, "Transfer");
        });
        it("Should transfer unsuccessfully", async function () {
            const { game, owner, account1} = await loadFixture(deploy);
            game.awardItem(owner.address, "aaa0");
            await expect(game.transferFrom(owner.address, account1.address, 0)).to.emit(game, "Transfer");
            await expect(game.transferFrom(owner.address, account1.address, 0)).to.be.revertedWith("ERC721: caller is not token owner nor approved");
            await expect(game.transferFrom(owner.address, account1.address, 1)).to.be.revertedWith("ERC721: invalid token ID");
        });
    });

    describe("GameItem TransferFrom(From others)", function () {
        it("Should transfer successfully", async function () {
            const { game, owner, account1, account2} = await loadFixture(deploy);
            game.awardItem(owner.address, "aaa0");
            game.awardItem(owner.address, "aaa1");
            await expect(game.setApprovalForAll(account1.address, true)).to.emit(game, "ApprovalForAll");
            await expect(game.connect(account1).transferFrom(owner.address, account2.address, 0)).to.emit(game, "Transfer");
            await expect(game.connect(account1).transferFrom(owner.address, account2.address, 1)).to.emit(game, "Transfer");
        });
        it("Should transfer successfully/unccessfully", async function () {
            const { game, owner, account1, account2} = await loadFixture(deploy);
            game.awardItem(owner.address, "aaa0");
            game.awardItem(owner.address, "aaa1");
            await expect(game.approve(account1.address, 0)).to.emit(game, "Approval");
            await expect(game.connect(account1).transferFrom(owner.address, account1.address, 0)).to.emit(game, "Transfer");
            await expect(game.connect(account1).transferFrom(owner.address, account1.address, 1)).to.be.revertedWith("ERC721: caller is not token owner nor approved");
        });
    });

    describe("GameItem SafeTransferFrom(to contract accounts)", function () {
        it("Should transfer successfully", async function () {
            const { game, owner, account1, ca} = await loadFixture(deploy);
            game.awardItem(owner.address, "aaa0");
            await expect(game["safeTransferFrom(address,address,uint256)"](owner.address, ca.address, 0)).to.emit(game, "Transfer").emit(ca, "OnERC721Received");
        });
    });
  });
  