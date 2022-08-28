const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");
  const fs = require("fs")

  describe("VerifySignature", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1] = await ethers.getSigners();

      const Forwarder = await ethers.getContractFactory("Forwarder");
      const forwarder = await Forwarder.deploy();

      const MetaNFT = await ethers.getContractFactory("MetaNFT");
      const metaNFT = await MetaNFT.deploy(forwarder.address);

      return { metaNFT, forwarder, owner, account1 };
    }

    async function getMintSignature(signer, verifyingContract, from, to, value, gas, data) {
        const [nonce, chainId] = await Promise.all([
            verifyingContract.getNonce(signer.address),
            signer.getChainId()
        ])

        const sigature =
            await signer._signTypedData(
                {
                    name: "MinimalForwarder",
                    version: "0.0.1",
                    chainId,
                    verifyingContract: verifyingContract.address
                },
                {
                    ForwardRequest: [
                        {
                            name: "from",
                            type: "address",
                        },
                        {
                            name: "to",
                            type: "address",
                        },
                        {
                            name: "value",
                            type: "uint256",
                        },
                        {
                            name: "gas",
                            type: "uint256",
                        },
                        {
                            name: "nonce",
                            type: "uint256",
                        },
                        {
                            name: "data",
                            type: "bytes",
                        },
                    ],
                },
                {
                    from,
                    to,
                    value,
                    gas,
                    nonce,
                    data
                }
            )

        return sigature;
    }

    const getTheAbi = (path) => {
        try {
            const file = fs.readFileSync(path, "utf8")
            const json = JSON.parse(file)
            const abi = json.abi
            return abi
        } catch (e) {
            console.log(`e`, e)
        }
    }

    describe("mint with signature", function () {
        it("Should mint successfully", async function () {
            const { metaNFT, forwarder, owner, account1} = await loadFixture(deploy);

            expect(await metaNFT.balanceOf(account1.address)).equal(0);

            const metaNFTAbi = getTheAbi("./artifacts/contracts/MetaNFT.sol/MetaNFT.json");
            const metaNFTInterface = new ethers.utils.Interface(metaNFTAbi);
            const data = metaNFTInterface.encodeFunctionData("safeMint");

            const nonce = await forwarder.getNonce(owner.address);
            const value = ethers.utils.parseEther("0");
            const gas = 5000000;

            const signature = await getMintSignature(
                account1,
                forwarder,
                account1.address,
                metaNFT.address,
                value,
                gas,
                data
            );

            const forwardRequest = {
                from: account1.address,
                to: metaNFT.address,
                value: value,
                gas: gas,
                nonce: nonce,
                data: data
            }
            await forwarder.execute(forwardRequest, signature);
            expect(await metaNFT.balanceOf(account1.address)).equal(1);

            await expect(forwarder.execute(forwardRequest, signature)).to.be.revertedWith("MinimalForwarder: signature does not match request");
        });
    });
  });