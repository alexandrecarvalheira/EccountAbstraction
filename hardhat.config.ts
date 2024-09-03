// Plugins
// Tasks
import "./tasks";
import "@nomicfoundation/hardhat-toolbox";
import {config as dotenvConfig} from "dotenv";
import "fhenix-hardhat-docker";
import "fhenix-hardhat-plugin";
import "fhenix-hardhat-network";
import "hardhat-deploy";
import {HardhatUserConfig} from "hardhat/config";
import {resolve} from "path";

// DOTENV_CONFIG_PATH is used to specify the path to the .env file for example in the CI
const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) });

const TESTNET_CHAIN_ID = 8008135;
const TESTNET_RPC_URL = "https://api.helium.fhenix.zone";

const testnetConfig = {
    chainId: TESTNET_CHAIN_ID,
    url: TESTNET_RPC_URL,
}

// Select either private keys or mnemonic from .env file or environment variables
const keys = process.env.WALLET;

if (!keys) {
  throw new Error("Please set your MNEMONIC in a .env file");
}
const accounts: string[] = [keys];


const config: HardhatUserConfig = {
  solidity: "0.8.25",
  defaultNetwork: "localfhenix",
  networks: {
    testnet: testnetConfig,
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
};

export default config;
