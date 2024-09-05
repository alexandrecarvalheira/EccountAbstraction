// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@fhenixprotocol/contracts/FHE.sol";
import {Permissioned, Permission} from "@fhenixprotocol/contracts/access/Permissioned.sol";

import "./SimpleEccount.sol";

/**
 * A sample factory contract for SimpleAccount
 * A UserOperations "initCode" holds the address of the factory, and a method call (to createAccount, in this sample factory).
 * The factory's createAccount returns the target account address even if it is already installed.
 * This way, the entryPoint.getSenderAddress() can be called either before or after the account is created.
 */
contract SimpleEccountFactory {
  IEntryPoint entryPoint;
  mapping(eaddress => address) private accounts;

  constructor(IEntryPoint _entryPoint) {
    entryPoint = _entryPoint;
  }

  /**
   * create an account, and return its address.
   * returns the address even if the account is already deployed.
   * Note that during UserOperation execution, this method is called only if the account is not deployed.
   * This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation
   */
  function createAccount(
    inEaddress calldata _owner,
    uint256 salt
  ) public returns (SimpleEccount ret) {
    eaddress owner = FHE.asEaddress(_owner);
    address addr = getAddress(owner, salt);
    uint256 codeSize = addr.code.length;
    if (codeSize > 0) {
      return SimpleEccount(payable(addr));
    }
    ret = new SimpleEccount(_owner);
    accounts[owner] = address(ret);
  }

  /**
   * calculate the counterfactual address of this account as it would be returned by createAccount()
   */
  function getAddress(
    eaddress owner,
    uint256 salt
  ) private view returns (address) {
    return accounts[owner];
  }

  function getEddress(
    inEaddress calldata _owner,
    uint256 salt
  ) public view returns (address) {
    eaddress owner = FHE.asEaddress(_owner);

    return getAddress(owner, salt);
  }
}
