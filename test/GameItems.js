const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
const { ethers } = require("hardhat");
  
  describe("GameItem", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1, account2] = await ethers.getSigners();
  
      const Games = await ethers.getContractFactory("GameItems");
      const games = await Games.deploy();

      const CA = await ethers.getContractFactory("ContractAccount");
      const ca = await CA.deploy();
  
      return { games, owner, account1, account2, ca};
    }

    describe("GameItems query balance", function () {
        it("Query balance", async function () {
            const { games, owner, account1} = await loadFixture(deploy);
            expect(await games.balanceOf(owner.address, 0)).to.equal(ethers.utils.parseEther("1"));
            expect(await games.balanceOf(owner.address, 1)).to.equal(ethers.utils.parseEther("1000000000"));
            expect(await games.balanceOf(owner.address, 2)).to.equal(1);
            expect(await games.balanceOf(owner.address, 3)).to.equal(1000000000);
            expect(await games.balanceOf(owner.address, 4)).to.equal(1000000000);
        });
    });
  
    describe("GameItem SafeTransferFrom(From self)", function () {
        it("Should transfer successfully", async function () {
            const { games, owner, account1} = await loadFixture(deploy);
            await expect(games.safeTransferFrom(owner.address, account1.address, 2, 1, [])).to.emit(games, "TransferSingle");
        });
        it("Should transfer unsuccessfully", async function () {
            const { games, owner, account1} = await loadFixture(deploy);
            await expect(games.safeTransferFrom(owner.address, account1.address, 2, 2, [])).to.be.revertedWith("ERC1155: insufficient balance for transfer");
        });
    });

    describe("GameItem SafeBatchTransferFrom(From self)", function () {
        it("Should transfer successfully", async function () {
            const { games, owner, account1} = await loadFixture(deploy);
            await expect(games.safeBatchTransferFrom(owner.address, account1.address, [1, 2], [1000, 1], [])).to.emit(games, "TransferBatch");
        });
        it("Should transfer unsuccessfully", async function () {
            const { games, owner, account1} = await loadFixture(deploy);
            await expect(games.safeBatchTransferFrom(owner.address, account1.address, [1, 2], [1000, 2], [])).to.be.revertedWith("ERC1155: insufficient balance for transfer");
        });
    });

    describe("GameItem SafeTransferFrom(From others)", function () {
        it("Should transfer successfully after approving", async function () {
            const { games, owner, account1, account2} = await loadFixture(deploy);
            await expect(games.connect(account1).safeTransferFrom(owner.address, account2.address, 2, 1, [])).to.be.revertedWith("ERC1155: caller is not token owner nor approved");
            await expect(games.setApprovalForAll(account1.address, true)).to.emit(games, "ApprovalForAll");
            await expect(games.connect(account1).safeTransferFrom(owner.address, account2.address, 2, 1, [])).to.emit(games, "TransferSingle");
        });
    });

    describe("GameItem SafeTransferFrom(to contract address)", function () {
        it("Should transfer successfully", async function () {
            const { games, owner, account1, account2, ca} = await loadFixture(deploy);
            await expect(games.safeTransferFrom(owner.address, ca.address, 2, 1, [])).to.emit(games, "TransferSingle").to.emit(ca, "OnERC1155Received");
            await expect(games.safeBatchTransferFrom(owner.address, ca.address, [0, 1], [1, 1], [])).to.emit(games, "TransferBatch").to.emit(ca, "OnERC1155BatchReceived");
        });
    });
  });
  