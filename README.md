# Merkle Airdrop Smart Contract

```This repository contains a smart contract implementation for a Merkle-based airdrop on the Ethereum blockchain. The airdrop allows users to claim tokens if they are included in the Merkle tree of eligible addresses.```

## Setup and Installation

### Prerequisites
 - Node.js (v14 or higher)
 - npm or yarn
 - Hardhat (for deployment and testing)
 - An Ethereum wallet (like MetaMask) with testnet or mainnet funds


### Installation
1. Clone the repository:

``` shell git clone https://github.com/your-username/merkle-airdrop.git
cd merkle-airdrop
```

### Install dependencies:

npm install
# or
yarn install

Configure the environment:

Create a .env file at the root of the project and add the necessary configurations

npm install
# or
yarn install

Running the merkle.js Script
Description
The merkle.js script reads a CSV file (airdrop.csv) containing Ethereum addresses and their corresponding token amounts, generates a Merkle tree, and outputs the Merkle root. Additionally, it allows you to generate proofs for individual addresses to claim their tokens.

Usage

1. Prepare the CSV file:

Create an airdrop.csv file in the root directory with the following format:

csv
Copy code
address,amount
0x123...abc,100
0x456...def,20


Run the script:

bash
Copy code
npx ts-node src/merkle.ts
The script will output the Merkle root and proofs for the addresses listed in the CSV.

Retrieve proofs:

The script also provides a method to retrieve the proof for a specific address, which can be used in the claim function of the MerkleAirdrop contract.

Deploying the MerkleAirdrop Contract
Steps
Compile the contract:

bash
Copy code
npx hardhat compile
Deploy the contract:

Update the deployment script (e.g., scripts/deploy.ts) with the ERC20 token address, Merkle root, and owner address. Then run:

bash
Copy code
npx hardhat run scripts/deploy.ts --network your-network
Verify the deployment:

Once deployed, the contract address and transaction hash will be printed. You can verify the contract on Etherscan using the Hardhat verification plugin:

bash
Copy code
npx hardhat verify --network your-network DEPLOYED_CONTRACT_ADDRES


Generating Proofs for Airdrop Claims
Steps
Generate Proofs:

To generate a proof for an address, ensure the address is included in the CSV file and run the merkle.js script. The script will output a proof for each address, which can be used to claim tokens.

Claim Tokens:

Users can claim their tokens by calling the claim function in the MerkleAirdrop contract. The function requires the amount and proof as parameters:

solidity
Copy code
function claim(uint256 amount, bytes32[] calldata proof) external;
Users can interact with the contract using a web3 interface (like ethers.js or web3.js), or directly through a platform like Etherscan if the contract is verified.

Assumptions and Limitations
One-Time Claim: Each address can only claim tokens once. The hasClaimed mapping ensures that no double claims are allowed.
Merkle Tree Consistency: The Merkle root must be consistent with the list of addresses and amounts provided in the airdrop.csv file. Any modification to this file will require re-generating the Merkle root and redeploying the contract.
Token Sufficiency: Ensure that the ERC20 token contract has a sufficient balance to cover all potential claims before the airdrop begins.
Gas Costs: Users will need to pay gas fees to claim their tokens, which may vary depending on network congestion.
CSV File Integrity: The format and content of the airdrop.csv file should be carefully managed. Any errors or inconsistencies can lead to invalid proofs, preventing users from claiming their tokens.
Security Considerations: The updateMerkleRoot and withdrawTokens functions are restricted to the owner. Ensure the owner’s address is secure to prevent unauthorized access.


