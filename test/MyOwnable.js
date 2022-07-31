const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("MyOwnable", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await ethers.getSigners();
  
      const MyOwnable = await ethers.getContractFactory("MyOwnable");
      const myOwnable = await MyOwnable.deploy();
  
      return { myOwnable, owner, otherAccount };
    }
  
    describe("Do things", function () {
        it("Owner should do normal things successfully", async function () {
            const { myOwnable, owner, otherAccount } = await loadFixture(deploy);
            await expect(myOwnable.normalThing()).not.to.be.reverted;
        });

        it("Others should do normal things successfully", async function () {
            const { myOwnable, owner, otherAccount } = await loadFixture(deploy);
            await expect(myOwnable.connect(otherAccount).normalThing()).not.to.be.reverted;
        });

        it("Owner should do special things successfully", async function () {
            const { myOwnable, owner, otherAccount } = await loadFixture(deploy);
            await expect(myOwnable.specialThing()).not.to.be.reverted;
        });

        it("Others should do special things unsuccessfully", async function () {
            const { myOwnable, owner, otherAccount } = await loadFixture(deploy);
            await expect(myOwnable.connect(otherAccount).specialThing()).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Transfer Ownership", function () {
        it("Owner/Others should do special things successfully/unsuccessfully", async function () {
            const { myOwnable, owner, otherAccount } = await loadFixture(deploy);
            await expect(myOwnable.transferOwnership(otherAccount.address)).to.emit(myOwnable, "OwnershipTransferred").withArgs(owner.address, otherAccount.address);
            await expect(myOwnable.specialThing()).to.be.revertedWith("Ownable: caller is not the owner");
            await expect(myOwnable.connect(otherAccount).specialThing()).not.to.be.reverted;
        });
    });

    describe("Renounce Ownership", function () {
        it("No one should do special things successfully", async function () {
            const { myOwnable, owner, otherAccount } = await loadFixture(deploy);
            await expect(myOwnable.renounceOwnership()).not.to.be.reverted;
            await expect(myOwnable.specialThing()).to.be.revertedWith("Ownable: caller is not the owner");
            await expect(myOwnable.connect(otherAccount).specialThing()).to.be.revertedWith("Ownable: caller is not the owner");

            await expect(myOwnable.transferOwnership(owner.address)).to.be.revertedWith("Ownable: caller is not the owner");
            await expect(myOwnable.renounceOwnership()).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
  });
  