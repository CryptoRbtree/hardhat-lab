const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
const { ethers } = require("hardhat");
  
  describe("Escrow", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1, account2] = await ethers.getSigners();
  
      const Escrow = await ethers.getContractFactory("EscrowTest");
      const escrow = await Escrow.deploy(account2.address);
  
      return { escrow, owner, account1, account2 };
    }
  
    describe("escrow", function () {
        it("escrow refund", async function () {
            const { escrow, owner, account1, account2 } = await loadFixture(deploy);

            await expect(escrow.deposit(account1.address, {value: ethers.utils.parseEther("2")})).to.be.emit(escrow, "Deposited");
            await expect(escrow.withdraw(account1.address)).to.be.revertedWith("ConditionalEscrow: payee is not allowed to withdraw");

            await expect(escrow.enableRefunds()).to.be.emit(escrow, "RefundsEnabled");
            await expect(escrow.withdraw(account1.address)).to.be.emit(escrow, "Withdrawn");
        });

        it("escrow close", async function () {
            const { escrow, owner, account1, account2 } = await loadFixture(deploy);

            await expect(escrow.deposit(account1.address, {value: ethers.utils.parseEther("2")})).to.be.emit(escrow, "Deposited");
            await expect(escrow.withdraw(account1.address)).to.be.revertedWith("ConditionalEscrow: payee is not allowed to withdraw");
        
            const balance1 = await ethers.provider.getBalance(account2.address);
            await expect(escrow.beneficiaryWithdraw()).to.be.revertedWith("RefundEscrow: beneficiary can only withdraw while closed");
            await expect(escrow.close()).to.be.emit(escrow, "RefundsClosed");
            await expect(escrow.beneficiaryWithdraw()).not.to.be.reverted;
            expect(await ethers.provider.getBalance(account2.address)).to.equal(balance1.add(ethers.utils.parseEther("2")));
        });
    });
  });
  