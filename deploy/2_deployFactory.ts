import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import chalk from "chalk";

const hre = require("hardhat");

//==entrypoint addr= 0x538C04cd32B199be1c7A88f8eB51E8DbeFEb0131
const deploySimpleAccountFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { fhenixjs, ethers } = hre;
    const { deploy } = hre.deployments;
    const [signer] = await ethers.getSigners();
    // only deploy on local test network.


  const entrypoint = await hre.deployments.get('EntryPoint')
  await deploy(
    'SimpleEccountFactory', {
      from: signer.address,
      args: [entrypoint.address],
      log: true,
    })

}

export default deploySimpleAccountFactory