const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");

  const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
  const BURNER_ROLE = "0x3c11d16cbaffd01df69ce1c404f6340ee057498f5f00246190ea54220576a848";
  
  describe("AccessControlToken", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1, account2] = await ethers.getSigners();
  
      const Token = await ethers.getContractFactory("AccessControlToken");
      const token = await Token.deploy(account1.address, account2.address);
  
      return { token, owner, account1, account2};
    }
  
    describe("Mint tokens", function () {
        it("Should mint successfully", async function () {
            const { token, owner, account1, account2 } = await loadFixture(deploy);
            await expect(token.connect(account1).mint(owner.address, 1000)).not.to.be.reverted;
        });
        it("Should mint unsuccessfully", async function () {
            const { token, owner, account1, account2 } = await loadFixture(deploy);
            await expect(token.connect(account2).mint(owner.address, 1000)).to.be.reverted;
        });
    });

    describe("Burn tokens", function () {
        it("Should burn successfully", async function () {
            const { token, owner, account1, account2 } = await loadFixture(deploy);
            await expect(token.connect(account1).mint(owner.address, 1000)).not.to.be.reverted;
            await expect(token.connect(account2).burn(owner.address, 1000)).not.to.be.reverted;
        });
        it("Should burn unsuccessfully", async function () {
            const { token, owner, account1, account2 } = await loadFixture(deploy);
            await expect(token.connect(account1).mint(owner.address, 1000)).not.to.be.reverted;
            await expect(token.connect(account1).burn(owner.address, 1000)).to.be.reverted;
        });
    });

    describe("Grant Role", function () {
        it("Should mint successfully after granting", async function () {
            const { token, owner, account1, account2 } = await loadFixture(deploy);
            await expect(token.connect(account2).mint(owner.address, 1000)).to.be.reverted;
            await expect(token.grantRole(MINTER_ROLE, account2.address)).to.emit(token, "RoleGranted");
            await expect(token.connect(account2).mint(owner.address, 1000)).not.to.be.reverted;
        });
    });

    describe("Revoke Role", function () {
        it("Should mint unsuccessfully after revoking", async function () {
            const { token, owner, account1, account2 } = await loadFixture(deploy);
            await expect(token.connect(account1).mint(owner.address, 1000)).not.to.be.reverted;
            await expect(token.revokeRole(MINTER_ROLE, account1.address)).to.emit(token, "RoleRevoked");
            await expect(token.connect(account1).mint(owner.address, 1000)).to.be.reverted;
        });
    });

    describe("Renounce Role", function () {
        it("Should mint unsuccessfully after renouncing", async function () {
            const { token, owner, account1, account2 } = await loadFixture(deploy);
            await expect(token.connect(account1).mint(owner.address, 1000)).not.to.be.reverted;
            await expect(token.connect(account1).renounceRole(MINTER_ROLE, account1.address)).to.emit(token, "RoleRevoked");
            await expect(token.connect(account1).mint(owner.address, 1000)).to.be.reverted;
        });
    });

    describe("Grant Role Admin", function () {
        it("Should grant successfully after granting admin", async function () {
            const { token, owner, account1, account2 } = await loadFixture(deploy);
            await expect(token.connect(account1).grantRole(MINTER_ROLE, account2.address)).to.be.reverted;
            await expect(token.setRoleAdmin(MINTER_ROLE, MINTER_ROLE)).to.emit(token, "RoleAdminChanged");
            await expect(token.connect(account1).grantRole(MINTER_ROLE, account2.address)).to.emit(token, "RoleGranted");
        });
    });

  });
  