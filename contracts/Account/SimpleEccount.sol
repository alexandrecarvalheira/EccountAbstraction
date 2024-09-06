// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

/* solhint-disable avoid-low-level-calls */
/* solhint-disable no-inline-assembly */
/* solhint-disable reason-string */
import {FHE} from "@fhenixprotocol/contracts/FHE.sol";

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

import "../core/BaseAccount.sol";
/**
 * minimal account.
 *  this is sample minimal account.
 *  has execute, eth handling methods
 *  has a single signer that can send requests through the entryPoint.
 */
contract SimpleEccount is BaseAccount, Initializable {
  IEntryPoint private immutable _entryPoint;
  eaddress public owner;
  uint256 counter;
  euint8 private ZERO = FHE.asEuint8(0);
  euint8 private ONE = FHE.asEuint8(1);

  // solhint-disable-next-line no-empty-blocks
  receive() external payable {}

  constructor(inEaddress memory _owner) {
    owner = FHE.asEaddress(_owner);
    _entryPoint = IEntryPoint(
      address(0x3c30BC0FF3e2046436b093BC356f814634429F6f)
    );
  }

  function execute() external {
    counter++;
  }

  function getOwner() public view returns (address) {
    eaddress este = FHE.asEaddress(address(this));
    return FHE.decrypt(este);
  }

  function getCounter() public view returns (uint256) {
    return counter;
  }

  function entryPoint() public view virtual override returns (IEntryPoint) {
    return _entryPoint;
  }
  /**
   * @dev The _entryPoint member is immutable, to reduce gas consumption.  To upgrade EntryPoint,
   * a new implementation of SimpleAccount must be deployed with the new EntryPoint address, then upgrading
   * the implementation by calling `upgradeTo()`
   */
  function initialize(eaddress anOwner) public virtual initializer {
    _initialize(anOwner);
  }

  function _initialize(eaddress anOwner) internal virtual {
    owner = anOwner;
  }

  // Require the function call went through EntryPoint or owner
  function _requireFromEntryPointOrOwner() internal view {
    require(
      msg.sender == address(entryPoint()),
      "account: not Owner or EntryPoint"
    );
  }

  /// implement template method of BaseAccount
  function _validateSignature(
    UserOperation calldata userOp,
    bytes32 userOpHash
  ) internal virtual override returns (uint256 validationData) {
    eaddress anOwner = FHE.asEaddress(userOp.owner);
    FHE.req(FHE.eq(anOwner, owner));
    return 0;
  }

  function _call(address target, uint256 value, bytes memory data) internal {
    (bool success, bytes memory result) = target.call{value: value}(data);
    if (!success) {
      assembly {
        revert(add(result, 32), mload(result))
      }
    }
  }
}
