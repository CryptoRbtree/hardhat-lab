require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
      ropsten: {
        url: `https://ropsten.infura.io/v3/${process.env.INFURA_ID}`,
        accounts: [`${process.env.ACCOUNT_KEY}`]
      },
      rinkeby: {
        url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_ID}`,
        accounts: [`${process.env.ACCOUNT_KEY}`]
      },
      goerli: {
        url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`,
        accounts: [`${process.env.ACCOUNT_KEY}`]
      }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};
