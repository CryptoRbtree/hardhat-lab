const { ethers, upgrades } = require("hardhat");

async function main() {
    const V1 = await ethers.getContractFactory("UUPSV1")
    const V2 = await ethers.getContractFactory("UUPSV2")

    const v1 = await upgrades.deployProxy(V1, [42], {
        initializer: "initialize",
        kind: 'uups'
    })
    await v1.increase()

    const v2 = await upgrades.upgradeProxy(v1.address, V2, {kind: 'uups'})
    await v2.increase()
    await v2.val()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
});