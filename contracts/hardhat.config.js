require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true  // 启用 IR 优化，解决栈深度问题
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    hashkeyTestnet: {
      url: process.env.HASHKEY_RPC_URL || "https://testnet.hsk.xyz",
      chainId: 133,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    hashkeyMainnet: {
      url: "https://mainnet.hsk.xyz",
      chainId: 177,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      hashkeyTestnet: process.env.HASHKEY_API_KEY || "placeholder"
    },
    customChains: [
      {
        network: "hashkeyTestnet",
        chainId: 133,
        urls: {
          apiURL: "https://testnet.hsk.xyz/api",
          browserURL: "https://testnet.hsk.xyz"
        }
      }
    ]
  }
};
