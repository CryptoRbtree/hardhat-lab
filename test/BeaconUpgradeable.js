const { expect } = require("chai");

describe("Beacon", function() {
    it('works', async () => {
        const [_, account1] = await hre.ethers.getSigners()

        const V1 = await ethers.getContractFactory("ShipV1")
        const V2 = await ethers.getContractFactory("ShipV2")
        const failV2 = await V2.connect(account1)

        const beacon = await upgrades.deployBeacon(V1)
        await beacon.deployed()

        const v1 = await upgrades.deployBeaconProxy(beacon, V1, ["SHIP", 2])
        await v1.deployed()
        expect(await v1.name()).to.equal("SHIP")
        await expect(v1.move()).to.be.emit(v1, "Move")
        expect(await v1.fuel()).to.equal(1)

        await expect(upgrades.upgradeBeacon(beacon.address, failV2)).to.be.revertedWith("Ownable: caller is not the owner")
        await upgrades.upgradeBeacon(beacon.address, V2)
        const v2 = V2.attach(v1.address)
        await expect(v2.refuel()).to.be.emit(v2, "Refuel")
        expect(await v2.fuel()).to.equal(2)
    });
});