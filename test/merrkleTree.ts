import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

describe("MerkleAirdrop", function () {
  async function deployTokenFixture() {
  
    const erc20Token = await hre.ethers.getContractFactory("Web3CXI");
    const token = await erc20Token.deploy();
    return { token };
  }

  async function deployMerkleAirdropFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const { token } = await loadFixture(deployTokenFixture);

    // Sample airdrop data
    const airdropList = [
      { address: owner.address, amount: 100 },
      { address: otherAccount.address, amount: 200 },
    ];

    // Generate Merkle Tree and Root
    const leaves = airdropList.map(({ address, amount }) =>
      keccak256(ethers.solidityPacked(["address", "uint256"], [address, amount]))
    );
    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const merkleRoot = merkleTree.getHexRoot();
    const tokenAddress = await token.getAddress();

    const merkleAirdrop = await hre.ethers.getContractFactory("MerkleAirdrop");
    const airdrop = await merkleAirdrop.deploy(tokenAddress, merkleRoot);

 

    return { token, airdrop, merkleTree, owner, otherAccount };
  }

  it("should allow a valid claim", async function () {
    const { token, airdrop, merkleTree, owner } = await loadFixture(deployMerkleAirdropFixture);

    // Generate Merkle Proof for owner
    const leaf = keccak256(ethers.solidityPacked(["address", "uint256"], [owner.address, 100]));
    const proof = merkleTree.getHexProof(leaf);


    // Approve and fund the airdrop contract
    await token.transfer(airdrop.getAddress(), 300);
    await airdrop.claim(100, proof);

    expect(await token.balanceOf(owner.address)).to.equal(100);
  });

  it("should reject a double claim", async function () {
    const { token, airdrop, merkleTree, owner } = await loadFixture(deployMerkleAirdropFixture);

    const leaf = keccak256(ethers.solidityPacked(["address", "uint256"], [owner.address, 100]));
    const proof = merkleTree.getHexProof(leaf);

    await token.transfer(airdrop.getAddress(), 300);
    await airdrop.claim(100, proof);

    await expect(airdrop.claim(100, proof)).to.be.revertedWith("Airdrop already claimed.");
  });

  it("should reject an invalid proof", async function () {
    const { token, airdrop, owner } = await loadFixture(deployMerkleAirdropFixture);

    const invalidProof = ["0x0000000000000000000000000000000000000000000000000000000000000000"];

    await token.transfer(airdrop.getAddress(), 300);

    await expect(airdrop.claim(100, invalidProof)).to.be.revertedWith("Invalid proof.");
  });

  it("should allow the owner to withdraw unclaimed tokens", async function () {
    const { token, airdrop, owner } = await loadFixture(deployMerkleAirdropFixture);

    await token.transfer(airdrop.getAddress(), 300);

    await airdrop.withdrawTokens(owner.address);

    expect(await token.balanceOf(owner.address)).to.equal(300);
  });
});

