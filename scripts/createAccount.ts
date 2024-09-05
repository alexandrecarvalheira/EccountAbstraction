import axios from "axios";
const hre = require("hardhat");

export async function createAccount() {
  const { fhenixjs, ethers } = hre;
  const accounts = await hre.ethers.getSigners();
  const contractOwner = accounts[0];
  const { deploy } = hre.deployments;
  const [signer] = await ethers.getSigners();
  const factoryAddress = "0x55fCb0227536B6b509071f4017DDA4ecF031c7c2";
  const entrypointAddress = "0x3c30BC0FF3e2046436b093BC356f814634429F6f";

  const Eowner = await fhenixjs.encrypt_address(contractOwner.address);

  const entrypoint = await hre.ethers.getContractFactory(
    "EntryPoint",
    entrypointAddress,
    contractOwner,
  );

  const Eaccount = await deploy("SimpleEccount", {
    from: signer.address,
    args: [Eowner],
    log: true,
    skipIfAlreadyDeployed: false,
  });

  console.log(`Eaccount contract : `, Eaccount.address);

  // const address = await SimpleEccoint.getEddress(Eowner, 1);
  // console.log("address", address);
}

createAccount();
