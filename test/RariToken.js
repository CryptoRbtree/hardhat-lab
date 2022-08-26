const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  async function getPermitSignature(signer, token, spender, value, deadline) {
    const [nonce, name, version, chainId] = await Promise.all([
      token.nonces(signer.address),
      token.name(),
      "1",
      signer.getChainId(),
    ])
  
    return ethers.utils.splitSignature(
      await signer._signTypedData(
        {
          name,
          version,
          chainId,
          verifyingContract: token.address,
        },
        {
          Permit: [
            {
              name: "owner",
              type: "address",
            },
            {
              name: "spender",
              type: "address",
            },
            {
              name: "value",
              type: "uint256",
            },
            {
              name: "nonce",
              type: "uint256",
            },
            {
              name: "deadline",
              type: "uint256",
            },
          ],
        },
        {
          owner: signer.address,
          spender,
          value,
          nonce,
          deadline,
        }
      )
    )
  }

  describe("GLDToken", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1, account2] = await ethers.getSigners();
  
      const Token = await ethers.getContractFactory("RariToken");
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
            await expect(token.transfer(account1.address, 2000)).to.be.revertedWithPanic(0x11);
        });
    });

    describe("Token TransferFrom", function () {
        it("Should transfer successfully", async function () {
            const { token, owner, account1, account2} = await loadFixture(deploy);
            await expect(token.connect(account1).transferFrom(owner.address, account2.address, 1000)).to.be.revertedWithPanic(0x11);
            await expect(token.approve(account1.address, 1000)).to.emit(token, "Approval");
            await expect(token.connect(account1).transferFrom(owner.address, account2.address, 1000)).to.emit(token, "Transfer");
            await expect(token.connect(account1).transferFrom(owner.address, account2.address, 1000)).to.be.revertedWithPanic(0x11);
        });
    });

    describe("Token TransferFrom with permit", function () {
        it("Should transfer successfully", async function () {
            const { token, owner, account1, account2} = await loadFixture(deploy);
            await expect(token.connect(account1).transferFrom(owner.address, account2.address, 1000)).to.be.revertedWithPanic(0x11);

            const { v, r, s } = await getPermitSignature(
                owner,
                token,
                account1.address,
                1000,
                ethers.constants.MaxUint256
            )
            await expect(token.connect(account1).permit(owner.address, account1.address, 1000, ethers.constants.MaxUint256, v, r, s)).to.emit(token, "Approval");
            await expect(token.connect(account1).transferFrom(owner.address, account2.address, 1000)).to.emit(token, "Transfer");
        });
    });
  });
  