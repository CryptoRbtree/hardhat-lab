// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { MerkleTree } = require('merkletreejs')
const SHA256 = require('crypto-js/sha256')
const keccak256 = require('keccak256')

async function main() {
    const leaves = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(x => SHA256(x))
    const tree = new MerkleTree(leaves, SHA256)
    const root = tree.getRoot().toString('hex')
    const leaf = SHA256('a')
    const proof = tree.getProof(leaf)
    //console.log(tree.toString())
    //console.log(proof)
    console.log(tree.verify(proof, leaf, root)) // true

    const proofIndices = [0, 3, 7]
    const proofLeaves = proofIndices.map(i => leaves[i])
    const multiProof = tree.getMultiProof(proofIndices)
    console.log(tree.verifyMultiProof(root, proofIndices, proofLeaves, leaves.length, multiProof))

    const badLeaves = ['a', 'x', 'c', 'd'].map(x => SHA256(x))
    const badTree = new MerkleTree(badLeaves, SHA256)
    const badLeaf = SHA256('x')
    const badProof = badTree.getProof(badLeaf)
    console.log(tree.verify(badProof, leaf, root)) // false


    // keccak256 verifyMultiProofWithFlags
    {
        const leaves = ['a', 'b', 'c', 'd', 'e', 'f'].map(keccak256).sort(Buffer.compare)

        const tree = new MerkleTree(leaves, keccak256, { sort: true })
        const root = tree.getHexRoot()
        console.log(root == '0x1b404f199ea828ec5771fb30139c222d8417a82175fefad5cd42bc3a189bd8d5')

        const proofLeaves = [keccak256('b'), keccak256('d'), keccak256('f')].sort(Buffer.compare)
        //console.log(proofLeaves)

        const proof = tree.getMultiProof(proofLeaves)
        //console.log(proof)

        const proofFlags = tree.getProofFlags(proofLeaves, proof)
        //console.log(proofFlags)
        console.log(tree.verifyMultiProofWithFlags(root, proofLeaves, proof, proofFlags) == true)
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
