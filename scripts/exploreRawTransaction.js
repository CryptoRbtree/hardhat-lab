// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { sign } = require("crypto");
const hre = require("hardhat");

async function getRawTransaction(privateKey, transaction) {
    const wallet = new ethers.Wallet(privateKey)

    /* just for exploring */
    let serializedTransaction = await ethers.utils.serializeTransaction(transaction);
    console.log("serializedTransaction = ", serializedTransaction)

    const signingKey = new ethers.utils.SigningKey(privateKey)
    const hash = ethers.utils.keccak256(serializedTransaction)
    const signature = await signingKey.signDigest(hash)
    const { v, r, s } = signature
    console.log("v = ", v)
    console.log("r = ", r)
    console.log("s = ", s)
    /* just for exploring */

    let signedTransaction = await wallet.signTransaction(transaction)
    console.log("signedTransaction = ", signedTransaction)
    let parsedSignedTransaction = await ethers.utils.parseTransaction(signedTransaction)
    console.log("parsedSignedTransaction = ", parsedSignedTransaction)
    return signedTransaction
}

async function main() {
    const [signer, account1] = await hre.ethers.getSigners();

    console.log("1.send transaction");
    let chainId = await signer.getChainId();
    let nonce01 = await signer.getTransactionCount();
    let transaction01 = {
        to: account1.address, //'0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: ethers.utils.parseEther('1'),
        data: '0xE0A293E08F72454CEd99E1769c3ebd21fD2C20a1',
        gasLimit: '22000',
        maxFeePerGas: ethers.utils.parseUnits('20', 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits('5', 'gwei'),
        nonce: nonce01,
        type: 2,
        chainId: chainId,
    };
    let balanceBefore = await account1.getBalance();
    let tx = await signer.sendTransaction(transaction01);
    // console.log(tx);
    let balanceAfter = await account1.getBalance();
    console.log("balanceBefore = ", ethers.utils.formatEther(balanceBefore));
    console.log("balanceAfter = ", ethers.utils.formatEther(balanceAfter));
    console.log("--------------------------------------------");

    console.log("2.send raw transaction");
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    let nonce02 = await signer.getTransactionCount();
    let transaction02 = {
        to: account1.address, //'0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: ethers.utils.parseEther('2'),
        data: '0xE0A293E08F72454CEd99E1769c3ebd21fD2C20a1',
        gasLimit: '22000',
        maxFeePerGas: ethers.utils.parseUnits('20', 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits('5', 'gwei'),
        //gasPrice: ethers.utils.parseUnits('20', 'gwei'),
        nonce: nonce02,
        type: 2,
        chainId: chainId,
    };
    balanceBefore = await account1.getBalance();
    let rawTransaction = await getRawTransaction(privateKey, transaction02);
    signer.provider.sendTransaction(rawTransaction);
    balanceAfter = await account1.getBalance();
    console.log("balanceBefore = ", ethers.utils.formatEther(balanceBefore));
    console.log("balanceAfter = ", ethers.utils.formatEther(balanceAfter));
    console.log("--------------------------------------------");

    let gasPrice = await signer.getGasPrice();
    console.log("gasPrice = ", ethers.utils.formatUnits(gasPrice, 9));
    let gas = await signer.estimateGas(transaction01);
    console.log("gas = ", gas);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
