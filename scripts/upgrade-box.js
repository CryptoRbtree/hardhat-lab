// scripts/upgrade-box.js
const { ethers, upgrades } = require("hardhat");

const BOX_ADDRESS = "0xB07B8F8FD7F31126cFA7fEAf6f1Fc21b92bf3DDa";

async function main() {
  const BoxV2 = await ethers.getContractFactory("BoxV2");
  const box = await upgrades.upgradeProxy(BOX_ADDRESS, BoxV2);
  console.log("Box upgraded");
}

main();