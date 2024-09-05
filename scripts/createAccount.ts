import axios from "axios";
const hre = require("hardhat");

export async function createAccount() {
    const { fhenixjs, ethers } = hre;
    const accounts = await hre.ethers.getSigners();
    const contractOwner = accounts[0]; 
 const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    
    const Factory = await hre.ethers.getContractAt("SimpleEccountFactory",factoryAddress, contractOwner );
    const Eowner = await fhenixjs.encrypt_address(contractOwner.address);
    // console.log("Factory deployed at", await Factory.createAccount(Eowner, 1));
    const address = await Factory["getAddress(eaddress,uint256)"](Eowner, 1);
    console.log("address", address);








}


createAccount();