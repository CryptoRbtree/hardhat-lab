const { expect } = require("chai");

describe("UUPS", function() {
    it('works', async () => {
        const [_, account1] = await hre.ethers.getSigners()

        const V1 = await ethers.getContractFactory("UUPSV1")
        const V2 = await ethers.getContractFactory("UUPSV2")
        const failV2 = await V2.connect(account1)

        const v1 = await upgrades.deployProxy(V1, [42], {
            initializer: "initialize",
            kind: 'uups'
        })

        expect(await v1.val()).to.equal(42)
        await expect(v1.initialize(100)).to.be.revertedWith("Initializable: contract is already initialized")
        await expect(v1.increase()).to.be.emit(v1, "IncreaseV1")
        expect((await v1.val())).to.equal(43)

        await expect(upgrades.upgradeProxy(v1.address, failV2, {kind: "uups"})).to.be.revertedWith("Ownable: caller is not the owner")
        const v2 = await upgrades.upgradeProxy(v1.address, V2, {
            kind: "uups"
        })

        expect(v1.address).to.equal(v2.address)
        await expect(v2.increase()).to.be.emit(v2, "IncreaseV2")
        expect((await v2.val())).to.equal(45)
    });
});