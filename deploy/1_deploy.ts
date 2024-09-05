import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

const hre = require("hardhat");

//==entrypoint addr= 0x538C04cd32B199be1c7A88f8eB51E8DbeFEb0131

const func: DeployFunction = async function () {
  const { fhenixjs, ethers } = hre;
  const { deploy } = hre.deployments;
  const [signer] = await ethers.getSigners();

  if ((await ethers.provider.getBalance(signer.address)).toString() === "0") {
    if (hre.network.name === "localfhenix") {
      await fhenixjs.getFunds(signer.address);
    } else {
      console.log(
        chalk.red(
          "Please fund your account with testnet FHE from https://faucet.fhenix.zone",
        ),
      );
      return;
    }
  }

  const counter = await deploy("Counter", {
    from: signer.address,
    args: [],
    log: true,
    skipIfAlreadyDeployed: false,
  });

  console.log(`Counter contract : `, counter.address);

  const Eowner = await fhenixjs.encrypt_address(signer.address);

  const ret = await deploy("EntryPoint", {
    from: signer.address,
    args: [],
    log: true,
    skipIfAlreadyDeployed: false,
  });
  console.log("==entrypoint addr=", ret.address);

  const Eaccount = await deploy("SimpleEccount", {
    from: signer.address,
    args: [Eowner],
    log: true,
    skipIfAlreadyDeployed: false,
  });

  console.log(`Eaccount contract : `, Eaccount.address);
};

export default func;
func.id = "deploy_counter";
func.tags = ["Counter"];
