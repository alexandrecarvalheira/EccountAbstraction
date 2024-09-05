import axios from "axios";
const hre = require("hardhat");

export async function interactAccount() {
    const { fhenixjs, ethers } = hre;
    const accounts = await hre.ethers.getSigners();
    const contractOwner = accounts[0]; 

    // instance Entrypoint
    // instance Counter
    // call entrypoint w userOp arguments to interact with the counter
    // do it again with the other account to check that only the owner can interact with the counter



    const Eowner = await fhenixjs.encrypt_address(contractOwner.address);








}


interactAccount();