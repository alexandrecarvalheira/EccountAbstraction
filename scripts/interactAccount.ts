import axios from "axios";
const hre = require("hardhat");

export async function interactAccount() {
  const { fhenixjs, ethers, deployments } = hre;
  const accounts = await hre.ethers.getSigners();
  const contractOwner = accounts[0];
  const invader = accounts[1];

  const entrypointDeployment = await deployments.get("EntryPoint");
  const entrypointAddress = await entrypointDeployment.address;
  const smartAccountDeployment = await deployments.get("SimpleEccount");
  const smartAccountAddress = await smartAccountDeployment.address;

  const entrypoint = await hre.ethers.getContractAt(
    "EntryPoint",
    entrypointAddress,
    contractOwner,
  );

  const smartAccount = await hre.ethers.getContractAt(
    "SimpleEccount",
    smartAccountAddress,
    contractOwner,
  );

  const smartEccountFactory = await hre.ethers.getContractFactory(
    "SimpleEccount",
  );

  const Eowner = await fhenixjs.encrypt_address(contractOwner.address);
  const Einvader = await fhenixjs.encrypt_address(invader.address);

  await hre.fhenixjs.getFunds(smartAccountAddress);

  //   const transfer = await contractOwner.sendTransaction({
  //     to: smartAccountAddress,
  //     value: ethers.parseEther("3"),
  //   });

  //   console.log("transfer", transfer);

  // instance Entrypoint
  // transfer eth to the smart account
  // call entrypoint w userOp arguments to interact with the counter
  // do it again with the other account to check that only the owner can interact with the counter

  //   struct UserOperation {
  //     address sender;
  //     uint256 nonce;
  //     bytes initCode;
  //     bytes callData;
  //     uint256 callGasLimit;
  //     uint256 verificationGasLimit;
  //     uint256 preVerificationGas;
  //     uint256 maxFeePerGas;
  //     uint256 maxPriorityFeePerGas;
  //     bytes paymasterAndData;
  //     bytes signature;
  //     inEaddress owner;
  //   }

  //   const encyrptedAmount = await fhenixjs.encrypt_uint32(2);
  console.log("initial counter", await smartAccount.getCounter());

  const callData = smartEccountFactory.interface.encodeFunctionData("execute");

  const userOp1 = {
    sender: smartAccountAddress,
    nonce:
      "0x" + (await entrypoint.getNonce(smartAccountAddress, 0)).toString(16),
    initCode: "0x",
    callData,
    callGasLimit: 20000_000,
    verificationGasLimit: 10000_000,
    preVerificationGas: 20_000,
    maxFeePerGas: hre.ethers.parseUnits("40", "gwei"),
    maxPriorityFeePerGas: hre.ethers.parseUnits("20", "gwei"),
    paymasterAndData: "0x",
    signature: "0x",
    owner: Eowner,
  };
  const userOp2 = {
    sender: smartAccountAddress,
    nonce:
      "0x" + (await entrypoint.getNonce(smartAccountAddress, 0)).toString(16),
    initCode: "0x",
    callData,
    callGasLimit: 20000_000,
    verificationGasLimit: 10000_000,
    preVerificationGas: 20_000,
    maxFeePerGas: hre.ethers.parseUnits("40", "gwei"),
    maxPriorityFeePerGas: hre.ethers.parseUnits("20", "gwei"),
    paymasterAndData: "0x",
    signature: "0x",
    owner: Einvader,
  };
  const { maxFeePerGas } = await ethers.provider.getFeeData();

  userOp1.maxFeePerGas = "0x" + maxFeePerGas.toString(16);

  userOp2.maxFeePerGas = "0x" + maxFeePerGas.toString(16);

  await entrypoint.handleOps([userOp1], smartAccountAddress, {
    gasLimit: 1500000000,
  });
  console.log("sending UserOp from Owner.....");

  console.log("new counter:", await smartAccount.getCounter());

  console.log("sending UserOp from wrong Owner.....");

  try {
    await entrypoint.handleOps([userOp2], smartAccountAddress, {
      gasLimit: 1500000000,
    });
  } catch (e) {
    console.log(e);
  }

  console.log("new counter:", await smartAccount.getCounter());
}

interactAccount();
