// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

/* solhint-disable avoid-low-level-calls */
/* solhint-disable no-inline-assembly */
/* solhint-disable reason-string */
import {FHE} from "@fhenixprotocol/contracts/FHE.sol";

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

import "../core/BaseAccount.sol";
/**
 * minimal account.
 *  this is sample minimal account.
 *  has execute, eth handling methods
 *  has a single signer that can send requests through the entryPoint.
 */
contract SimpleEccount is BaseAccount, UUPSUpgradeable, Initializable {
  using ECDSA for bytes32;

  eaddress private owner;

  IEntryPoint private immutable _entryPoint;

  event SimpleAccountInitialized(IEntryPoint indexed entryPoint);

  modifier onlyOwner() {
    _onlyOwner();
    _;
  }

  /// @inheritdoc BaseAccount
  function entryPoint() public view virtual override returns (IEntryPoint) {
    return _entryPoint;
  }

  // solhint-disable-next-line no-empty-blocks
  receive() external payable {}

  constructor(IEntryPoint anEntryPoint) {
    _entryPoint = anEntryPoint;
    _disableInitializers();
  }

  function _onlyOwner() internal view {
    //directly from EOA owner, or through the account itself (which gets redirected through execute())
    require(msg.sender == address(this), "only owner");
  }

  /**
   * execute a transaction (called directly from owner, or by entryPoint)
   */
  function execute(address dest, uint256 value, bytes calldata func) external {
    _requireFromEntryPointOrOwner();
    _call(dest, value, func);
  }

  /**
   * execute a sequence of transactions
   */
  function executeBatch(
    address[] calldata dest,
    bytes[] calldata func
  ) external {
    _requireFromEntryPointOrOwner();
    require(dest.length == func.length, "wrong array lengths");
    for (uint256 i = 0; i < dest.length; i++) {
      _call(dest[i], 0, func[i]);
    }
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
    emit SimpleAccountInitialized(_entryPoint);
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
    // bytes32 hash = MessageHashUtils.toEthSignedMessageHash(userOpHash);
    eaddress anOwner = FHE.asEaddress(userOp.owner);
    euint256 EvalidationData = FHE.select(
      FHE.eq(owner, anOwner),
      FHE.asEuint256(0),
      FHE.asEuint256(1)
    );
    validationData = FHE.decrypt(EvalidationData);
    // if (owner != userOp.owner)
    //     return SIG_VALIDATION_FAILED;
    // return SIG_VALIDATION_SUCCESS;
  }

  function _call(address target, uint256 value, bytes memory data) internal {
    (bool success, bytes memory result) = target.call{value: value}(data);
    if (!success) {
      assembly {
        revert(add(result, 32), mload(result))
      }
    }
  }

  /**
   * check current account deposit in the entryPoint
   */
  function getDeposit() public view returns (uint256) {
    return entryPoint().balanceOf(address(this));
  }

  /**
   * deposit more funds for this account in the entryPoint
   */
  function addDeposit() public payable {
    entryPoint().depositTo{value: msg.value}(address(this));
  }

  /**
   * withdraw value from the account's deposit
   * @param withdrawAddress target to send to
   * @param amount to withdraw
   */
  function withdrawDepositTo(
    address payable withdrawAddress,
    uint256 amount
  ) public onlyOwner {
    entryPoint().withdrawTo(withdrawAddress, amount);
  }

  function _authorizeUpgrade(address newImplementation) internal view override {
    (newImplementation);
    _onlyOwner();
  }
}
