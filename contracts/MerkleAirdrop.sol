// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
  

contract MerkleAirdrop is  ReentrancyGuard {  

    using SafeERC20 for IERC20;  

    bytes32 public  root;

    address tokenAddress;
    address public owner;

    mapping(address => bool) claimed;  

    constructor(bytes32 _root, address token) {
     root = _root;
     tokenAddress=token;
     owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    function hasClaimed() external view returns (bool) {
        return _hasClaimed(msg.sender);
    }

	function _hasClaimed(address user) private view returns (bool) {
        return claimed[user]; }

    function claim(bytes32[] calldata _proof, uint amount) external nonReentrant {
        address claimer = msg.sender;
        require(!claimed[claimer], "Already claimed air drop");
        claimed[claimer] = true;
        bytes32 _leaf = keccak256(abi.encodePacked(claimer, amount));
        require(
        MerkleProof.verify(_proof, root, _leaf),
        "Incorrect merkle proof"
        );
        require( IERC20(tokenAddress).balanceOf(address(this)) > amount, 'AIRDROP CLAIM: No token to release by airdropper');
        IERC20(tokenAddress).safeTransfer(claimer, amount);
    }

    function updateMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        root = _merkleRoot;
    }

    function withdrawTokens(uint256 amount) external onlyOwner {
        require(IERC20(tokenAddress).transfer(owner, amount), "Transfer failed.");
    }
}

