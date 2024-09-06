import axios from "axios";
const hre = require("hardhat");

export async function interactAccount() {
  const { fhenixjs, ethers } = hre;
  const accounts = await hre.ethers.getSigners();
  const contractOwner = accounts[0];
  const invader = accounts[1];

  const factoryAddress = "0x55fCb0227536B6b509071f4017DDA4ecF031c7c2";
  const entrypointAddress = "0x3c30BC0FF3e2046436b093BC356f814634429F6f";
  const counterAddress = "0x837dFc1A22Fa3A1cF2C0A33ce37530dAc89e2d2b";
  const smartAccountAddress = "0x74026fb659D2959188C648FC3Cae8d635b993B5D";

  const entrypoint = await hre.ethers.getContractAt(
    "EntryPoint",
    entrypointAddress,
    contractOwner,
  );

  const counter = await hre.ethers.getContractAt(
    "Counter",
    counterAddress,
    contractOwner,
  );

  const smartAccount = await hre.ethers.getContractAt(
    "SimpleEccount",
    smartAccountAddress,
    contractOwner,
  );

  console.log("smartAccount owner:", await smartAccount.getOwner());

  const smartEccountFactory = await hre.ethers.getContractFactory(
    "SimpleEccount",
  );
  const counterFactory = await hre.ethers.getContractFactory("Counter");

  const Factory = await hre.ethers.getContractAt(
    "SimpleEccountFactory",
    factoryAddress,
    contractOwner,
  );

  const Eowner = await fhenixjs.encrypt_address(contractOwner.address);
  const Einvader = await fhenixjs.encrypt_address(invader.address);

  console.log("smartAddress", smartAccountAddress);

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
  console.log("counter", await counter.getCounter());

  const callData = smartEccountFactory.interface.encodeFunctionData("execute");

  const userOp = {
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

  const { maxFeePerGas } = await ethers.provider.getFeeData();
  userOp.maxFeePerGas = "0x" + maxFeePerGas.toString(16);

  const result = await entrypoint.handleOps([userOp], smartAccountAddress, {
    gasLimit: 1500000000,
  });
  console.log("result", result);

  console.log("counter", await smartAccount.getCounter());
}

interactAccount();
