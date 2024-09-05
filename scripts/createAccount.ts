import axios from "axios";
const hre = require("hardhat");

export async function createAccount() {
    const { fhenixjs, ethers } = hre;
    const accounts = await hre.ethers.getSigners();
    const contractOwner = accounts[0]; 
 const factoryAddress = "0xD30C778F7Fd47CCfB93Caa589195eb288FC768c8";

    
    const Factory = await hre.ethers.getContractAt("SimpleEccountFactory",factoryAddress, contractOwner );
    const Eowner = await fhenixjs.encrypt_address(contractOwner.address);
 await Factory.createAccount(Eowner, 1);
    const address = await Factory.getEddress(Eowner, 1);
    console.log("address", address);








}


createAccount();