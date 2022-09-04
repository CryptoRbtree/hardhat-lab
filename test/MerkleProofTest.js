const {
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')

describe("MerkleProof", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
        // Contracts are deployed using the first signer/account by default
        const MerkleProof = await hre.ethers.getContractFactory("MerkleProofTest")
        const merkleProof = await MerkleProof.deploy()

        return { merkleProof }
    }

    describe("merkle proof", function () {
        it("Should proof successfully", async function () {
            const { merkleProof } = await loadFixture(deploy);

            const leaves = ["aa", "bb", "cc", "dd"].map(x => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(x)))
            const tree = new MerkleTree(leaves, ethers.utils.keccak256, { sort: true })
            const root = tree.getHexRoot()

            const leaf = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("aa"))
            const proof = tree.getHexProof(leaf)
            expect(await merkleProof.verify(proof, root, leaf)).equal(true)
        });

        it("Should proof unsuccessfully", async function () {
            const { merkleProof } = await loadFixture(deploy);

            const leaves = ["aa", "bb", "cc"].map(x => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(x)))
            const tree = new MerkleTree(leaves, ethers.utils.keccak256, { sort: true })
            const root = tree.getHexRoot()

            const badLeaves = ["aa", "bb", "xx", "dd"].map(x => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(x)))
            const badTree = new MerkleTree(badLeaves, ethers.utils.keccak256, { sort: true })

            const leaf = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("aa"))
            const badProof = badTree.getHexProof(leaf)
            expect(await merkleProof.verify(badProof, root, leaf)).equal(false)
        });

        it("Should multiproof successfully", async function () {
            const { merkleProof } = await loadFixture(deploy);

            const leaves = ["aa", "bb", "cc", "dd", "ee", "ff"].map(keccak256).sort(Buffer.compare)
            const tree = new MerkleTree(leaves, keccak256, { sort: true })
            const root = tree.getHexRoot()

            const proofLeaves = [keccak256('aa'), keccak256('dd'), keccak256('ff')].sort(Buffer.compare)
            const proof = tree.getMultiProof(proofLeaves)
            const proofFlags = tree.getProofFlags(proofLeaves, proof)
            expect(await merkleProof.multiProofVerify(proof, proofFlags, root, proofLeaves)).equal(true)
        });
    });
});