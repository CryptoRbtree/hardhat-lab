const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
const { ethers } = require("hardhat");
  
  describe("VerifySignature", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1] = await ethers.getSigners();
  
      const Signature = await ethers.getContractFactory("VerifySignature");
      const signature = await Signature.deploy();

      const ECDSA = await ethers.getContractFactory("ECDSATest");
      const ecdsa = await ECDSA.deploy();

      const SignatureChecker = await ethers.getContractFactory("SignatureCheckerTest");
      const signatureChecker = await SignatureChecker.deploy();
  
      return { signature, owner, account1, ecdsa, signatureChecker  };
    }
  
    describe("verify", function () {
        it("Should verify successfully", async function () {
            const { signature, owner, account1} = await loadFixture(deploy);
            
            const signer = owner;
            //const signer = new ethers.Wallet(`${process.env.ACCOUNT_KEY}`);
            const to = account1.address;
            const amount = 999;
            const message = "hello";
            const nonce = 123;

            const hash = await signature.getMessageHash(to, amount, message, nonce);
            const sig = await signer.signMessage(ethers.utils.arrayify(hash));

            const ethHash = await signature.getEthSignedMessageHash(hash);
            expect(await signature.recoverSigner(ethHash, sig)).to.equal(signer.address);

            expect(await signature.verify(signer.address, to, amount, message, nonce, sig)).to.equal(true);
            expect(await signature.verify(signer.address, to, amount + 1, message, nonce, sig)).to.equal(false);
        });
    });

    describe("ecdsa verify", function () {
      it("Should verify successfully", async function () {
          const { signature, owner, account1, ecdsa } = await loadFixture(deploy);
          const signer = owner;
          const hash = "0xcf36ac4f97dc10d91fc2cbb20d718e94a8cbfe0f82eaedc6a4aa38946fb797cd";
          const sig = await signer.signMessage(ethers.utils.arrayify(hash));
          const ethHash = await ecdsa["testToEthSignedMessageHash(bytes32)"](hash);
          expect(await ecdsa.testRecover(ethHash, sig)).to.equal(signer.address);
      });
      it("Should verify successfully", async function () {
        const { signature, owner, account1, ecdsa } = await loadFixture(deploy);
        const signer = owner;
        const message = "Hello World";
        //const messageBytes32 = ethers.utils.formatBytes32String(message);
        const messageBytes = ethers.utils.toUtf8Bytes(message);
        const sig = await signer.signMessage(messageBytes);
        const ethHash = await ecdsa["testToEthSignedMessageHash(bytes)"](messageBytes);
        expect(await ecdsa.testRecover(ethHash, sig)).to.equal(signer.address);
      });
    });

    describe("signature checker", function () {
      it("Should verify successfully", async function () {
          const { signature, owner, account1, ecdsa, signatureChecker } = await loadFixture(deploy);
          const signer = owner;
          const hash = "0xcf36ac4f97dc10d91fc2cbb20d718e94a8cbfe0f82eaedc6a4aa38946fb797cd";
          const sig = await signer.signMessage(ethers.utils.arrayify(hash));
          const ethHash = await ecdsa["testToEthSignedMessageHash(bytes32)"](hash);
          expect(await signatureChecker.isValidSignatureNow(signer.address, ethHash, sig)).to.equal(true);
      });
      it("Should verify successfully", async function () {
        const { signature, owner, account1, ecdsa, signatureChecker } = await loadFixture(deploy);
        const signer = owner;
        const message = "Hello World";
        //const messageBytes32 = ethers.utils.formatBytes32String(message);
        const messageBytes = ethers.utils.toUtf8Bytes(message);
        const sig = await signer.signMessage(messageBytes);
        const ethHash = await ecdsa["testToEthSignedMessageHash(bytes)"](messageBytes);
        expect(await signatureChecker.isValidSignatureNow(signer.address, ethHash, sig)).to.equal(true);
      });
    });
  });
  