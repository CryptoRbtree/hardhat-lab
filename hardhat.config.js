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
      },
      local: {
        url: `http://127.0.0.1:8545/`,
        accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
                   "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
                   "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
                   "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"]
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
