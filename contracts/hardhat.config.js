require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: __dirname + "/.env" });
const { LOC_URL, PRIVATE_KEY } = process.env;
const { config } = require("../frontend/constants");
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  solidity: "0.8.7",
  networks: {
    localhost: {
      url: config.LOC_URL,
      accounts: [config.LOC_PRIVATE_KEY],
    },
    testnet: {
      url: config.TEST_URL,
      accounts: [config.TEST_PRIVATE_KEY],
    },
    devnet: {
      url: config.DEV_URL,
      accounts: [config.DEV_PRIVATE_KEY],
    },
  },
};
// settings: {
//   optimizer: {
//     enabled: true,
//     runs: 200,
//   },
// },

// module.exports = {
//   defaultNetwork: "ropsten",
//   solidity: "0.8.4",
//   networks: {
//     ropsten: {
//       url: process.env.RPC_URL,
//       accounts:
//         process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
//         chainId: ?????,
//     },
//   },
