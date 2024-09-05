import axios from "axios";
import { concat } from "../utils/concat";
import { pad } from "../utils/pad";
import { numberToHex } from "../utils/toHex";
const hre = require("hardhat");

export async function interactAccount() {
  const { fhenixjs, ethers } = hre;
  const accounts = await hre.ethers.getSigners();
  const contractOwner = accounts[0];

  const factoryAddress = "0x5c93e3B7824035B375E373FaC1578D4089dcE77A";
  const entrypointAddress = "0xB170fC5BAC4a87A63fC84653Ee7e0db65CC62f96";
  const counterAddress = "0xbeb4eF1fcEa618C6ca38e3828B00f8D481EC2CC2";

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

  const counterFactory = await hre.ethers.getContractFactory("Counter");

  const Factory = await hre.ethers.getContractAt(
    "SimpleEccountFactory",
    factoryAddress,
    contractOwner,
  );

  const Eowner = await fhenixjs.encrypt_address(contractOwner.address);

  const smartAddress = await Factory.getEddress(Eowner, 1);

  //   const transfer = await contractOwner.sendTransaction({
  //     to: smartAddress,
  //     value: ethers.parseEther("0.1"),
  //   });

  //   console.log("transfer", transfer);

  // instance Entrypoint
  // transfer eth to the smart account
  // call entrypoint w userOp arguments to interact with the counter
  // do it again with the other account to check that only the owner can interact with the counter

  //   struct PackedUserOperation {0
  //     address sender;
  //     uint256 nonce;
  //     bytes initCode;
  //     bytes callData;
  //     bytes32 accountGasLimits;
  //     uint256 preVerificationGas;
  //     bytes32 gasFees;
  //     bytes paymasterAndData;
  //     bytes signature;
  //     inEaddress owner;
  // }
  const encyrptedAmount = await fhenixjs.encrypt_uint32(2);
  console.log("counter", await counter.getCounter());

  const callData = counterFactory.interface.encodeFunctionData("add", [
    encyrptedAmount,
  ]);

  const accountGasLimits = concat([
    pad(numberToHex(500_000), { size: 16 }),
    pad(numberToHex(500_000), { size: 16 }),
  ]);
  const gasFees = concat([
    pad(numberToHex(500_000), { size: 16 }),
    pad(numberToHex(500_000), { size: 16 }),
  ]);
  const userOp = {
    sender: smartAddress,
    nonce: 0,
    initCode: "0x",
    callData,
    accountGasLimits,
    preVerificationGas: 500_000,
    gasFees,
    paymasterAndData: "0x",
    signature: "0x",
    owner: Eowner,
  };

  const result = await entrypoint.handleOps([userOp], contractOwner.address);
  console.log("result", result);

  console.log("counter", await counter.getCounter());
}

interactAccount();
