import axios from "axios";
import { concat } from "../utils/concat";
import { pad } from "../utils/pad";
import { numberToHex } from "../utils/toHex";
const hre = require("hardhat");

export async function interactAccount() {
  const { fhenixjs, ethers } = hre;
  const accounts = await hre.ethers.getSigners();
  const contractOwner = accounts[0];

  const factoryAddress = "0xF95c55491C7CaC88D9eEa99BbFBbf55aCe96c0cd";
  const entrypointAddress = "0xc172fc2df2E4841DFf0e2A8395318E51dB031053";
  const counterAddress = "0x88d9076cBe1445ad13F63D3b44d95e07582fFe82";

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
  console.log("smartAddress", smartAddress.getBalance);

  //   const transfer = await contractOwner.sendTransaction({
  //     to: smartAddress,
  //     value: ethers.parseEther("0.1"),
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

  const encyrptedAmount = await fhenixjs.encrypt_uint32(2);
  console.log("counter", await counter.getCounter());

  const callData = counterFactory.interface.encodeFunctionData("add", [
    encyrptedAmount,
  ]);

  const userOp = {
    sender: smartAddress,
    nonce: 0,
    initCode: "0x",
    callData,
    callGasLimit: 400_000,
    verificationGasLimit: 400_000,
    preVerificationGas: 100_000,
    maxFeePerGas: hre.ethers.parseUnits("20", "gwei"),
    maxPriorityFeePerGas: hre.ethers.parseUnits("10", "gwei"),
    paymasterAndData: "0x",
    signature: "0x",
    owner: Eowner,
  };

  const result = await entrypoint.handleOps([userOp], smartAddress);
  console.log("result", result);

  console.log("counter", await counter.getCounter());
}

interactAccount();
