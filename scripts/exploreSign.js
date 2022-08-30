// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function signTypedData01(signer, nonce, name, version, chainId, token, spender, value, deadline) {
    return ethers.utils.splitSignature(
      await signer._signTypedData(
        {
          name,
          version,
          chainId,
          verifyingContract: token
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

async function signTypedData02(signer, nonce, name, version, chainId, token, spender, value, deadline) {
    const abi = ethers.utils.defaultAbiCoder;

    const _PERMIT_TYPEHASH = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(
        "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"));

    const structHash = ethers.utils.keccak256(abi.encode(
        ["bytes32", "address", "address", "uint256", "uint256", "uint256"],
        [_PERMIT_TYPEHASH, signer.address, spender, value, nonce, deadline]));

    const typeHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"));
    const nameHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name));
    const versionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(version));
    const domainSeparator = ethers.utils.keccak256(abi.encode(
        ["bytes32", "bytes32", "bytes32", "uint256", "address"],
        [typeHash, nameHash, versionHash, chainId, token]
    ));

    const typedDataHash = ethers.utils.keccak256(ethers.utils.solidityPack(
        ["string", "bytes32", "bytes32"],
        ["\x19\x01", domainSeparator, structHash]));

    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    const signingKey = new ethers.utils.SigningKey(privateKey); // without prefix "\x19Ethereum Signed Message:\n32"

    const signature = await signingKey.signDigest(typedDataHash);

    return signature;
}

async function getTransactionSignature01(transaction, signer) {
    let tx = await signer.sendTransaction(transaction);
    return tx;
}

async function getTransactionSignature02(transaction) {
    let serializedTransaction = await ethers.utils.serializeTransaction(transaction);
    const hash = ethers.utils.keccak256(serializedTransaction);
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    const signingKey = new ethers.utils.SigningKey(privateKey);
    const signature = await signingKey.signDigest(hash);
    return signature;
}


async function main() {
    const [signer] = await ethers.getSigners(); // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    const chainId = await signer.getChainId();

    // 1. EIP712
    console.log("1.EIP712");
    const nonce = 0;
    const name = "Gold";
    const version = "1";
    const token = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";
    const spender = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const value = 1000;
    const deadline = ethers.constants.MaxUint256;

    const sigature01 = await signTypedData01(signer, nonce, name, version, chainId, token, spender, value, deadline);
    const sigature02 = await signTypedData02(signer, nonce, name, version, chainId, token, spender, value, deadline);
    console.log("signature01 = ", sigature01);
    console.log("signature02 = ", sigature02);

    // 2. transaction signature
    console.log("\n2.transaction signature");
    let transactionNonce = await signer.getTransactionCount();
    let transaction = {
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: ethers.utils.parseEther('1'),
        data: '0xE0A293E08F72454CEd99E1769c3ebd21fD2C20a1',
        gasLimit: '22000',
        maxFeePerGas: ethers.utils.parseUnits('20', 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits('5', 'gwei'),
        nonce: transactionNonce,
        type: 2,
        chainId: chainId
    };

    const transactionSignature01 = await getTransactionSignature01(transaction, signer);
    const transactionSignature02 = await getTransactionSignature02(transaction);
    console.log("transactionSignature01 = ", transactionSignature01);
    console.log("transactionSignature02 = ", transactionSignature02);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
