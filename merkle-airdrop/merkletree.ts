// -- Write a JavaScript script (merkle.js) that:
// Reads the CSV file.
// Hashes each entry in the format keccak256(address, amount).
// Constructs a Merkle tree from these hashed entries.
// Outputs the Merkle root.

// Note: Use the merkletreejs library to assist in generating the Merkle tree and root hash.
// Deliverable: The merkle.js script and the generated Merkle root.


import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import * as fs from 'fs';
import csv from 'csv-parser';

interface AirdropEntry {
  address: string;
  amount: string;
}

class MerkleAirdrop {
  private addressToLeaf: Record<string, Buffer> = {};
  private leaves: Buffer[] = [];
  private merkleTree: MerkleTree | null = null;
  private merkleRoot: string | null = null;

  constructor(private csvFilePath: string = "airdrop.csv") {}

  // Method to initialize the Merkle tree from the CSV file using async/await
  public async initialize(): Promise<void> {
    const readStream = fs.createReadStream(this.csvFilePath).pipe(csv());

    for await (const row of readStream) {
      // check address and amount are valid
      if (this.isValidAddress(row.address) && this.isValidAmount(row.amount)) {
        const leaf = keccak256(this.encodeLeaf(row.address, row.amount));
        this.leaves.push(leaf);
        this.addressToLeaf[row.address.toLowerCase()] = leaf;
      } else {
        console.warn(`Invalid entry skipped: ${JSON.stringify(row)}`);
      }
    }

    if (this.leaves.length === 0) {
      throw new Error('No valid airdrop entries found in the CSV.');
    }

    this.merkleTree = new MerkleTree(this.leaves, keccak256, { sortPairs: true });
    this.merkleRoot = this.merkleTree.getHexRoot();
    console.log('Merkle Root:', this.merkleRoot);
  }

  // Method to get the proof for a specific user
  public getUserProof(userAddress: string, userAmount: string): string[] | null {
    if (!this.merkleTree) {
      throw new Error('Merkle tree not initialized. Please call initialize() first.');
    }

    const normalizedAddress = userAddress.toLowerCase();
    const leaf = this.addressToLeaf[normalizedAddress];
    
    if (!leaf) {
      console.warn('Address not found');
      return null;
    }

    // Ensure the amount matches
    const expectedLeaf = keccak256(this.encodeLeaf(userAddress, userAmount));
    if (!leaf.equals(expectedLeaf)) {
      console.warn('Amount does not match the CSV entry.');
      return null;
    }

    return this.merkleTree.getHexProof(leaf);
  }

  public getMerkleRoot(): string | null {
    return this.merkleRoot;
  }

  // Helper method to encode the leaf as per Solidity's abi.encodePacked
  private encodeLeaf(address: string, amount: string): Buffer {
    return Buffer.concat([
      Buffer.from(address.slice(2).toLowerCase(), 'hex'),
      Buffer.from(this.toUint256(amount).slice(2), 'hex'),
    ]);
  }

  // Helper method to convert a string amount to a hex Uint256
  private toUint256(amount: string): string {
    const bn = BigInt(amount);
    return bn.toString(16).padStart(64, '0');
  }


  private isValidAddress(address: string): boolean {
    console.log({ address });
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  private isValidAmount(amount: string): boolean {
    console.log({ amount });
    return /^\d+$/.test(amount) && BigInt(amount) > 0;
  }
}
