const { ethers, upgrades } = require("hardhat");

function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

async function main() {
    const V1 = await ethers.getContractFactory("ShipV1")
    const V2 = await ethers.getContractFactory("ShipV2")

    const beacon = await upgrades.deployBeacon(V1)
    await beacon.deployed()

    const v1 = await upgrades.deployBeaconProxy(beacon, V1, ["SHIP", 2])
    await v1.deployed()
    await v1.name()
    await v1.move()
    await v1.fuel()

    await upgrades.upgradeBeacon(beacon.address, V2)
    const v2 = V2.attach(v1.address)
    await v2.refuel()
    await v2.fuel()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
});