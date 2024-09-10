
# Time-Limited Ownership DApp

This is a decentralized application (DApp) built on the Ethereum blockchain that allows users to create, rent, and manage time-limited ownership of real estate properties using NFTs (Non-Fungible Tokens). The DApp provides a mechanism for property owners to mint tokens representing properties and rent them out for specific time periods. Tenants can rent properties for defined periods, and the tokens are automatically transferred to their wallets for the duration of the lease.

## Features

- **Mint Property Tokens**: Property owners can create NFTs that represent real estate properties with metadata such as property address, area, number of rooms, and daily rent price.
- **Rent Properties**: Users can rent available properties for a specific time period. During the lease period, the token is transferred to the tenant's wallet, and once the lease expires, it is automatically reclaimed by the original owner.
- **Automatic Lease Activation**: The lease period is automatically tracked, and the token is transferred to the tenant at the start of the lease period.
- **Reclaim Tokens**: Property owners can reclaim their tokens automatically or manually when the lease period ends.
- **Transfer Ownership**: Token holders can transfer their NFTs to other addresses.

## How It Works

1. **Minting Property Tokens**: 
   - Property owners can mint a new token representing a property. The owner must input the property details, including address, area, number of rooms, and daily rent price. The token is stored as an ERC721 NFT on the Ethereum blockchain.

2. **Renting Properties**:
   - Users can rent properties for a specific time period. The DApp ensures that the token is only transferred when the lease period begins, and the token will remain with the tenant during the lease period. The original owner cannot reclaim the token until the lease period ends.
   - The rental payment is handled in ETH.

3. **Token Transfers**:
   - During the lease period, the tenant can transfer the token to another address, allowing further flexibility in ownership.

4. **Automatic Lease Activation**:
   - The token is automatically transferred to the tenant's wallet when the lease period begins. This process can be automated via a backend service or by integrating with Chainlink Keepers to ensure seamless transfers.

5. **Reclaiming Tokens**:
   - Once the lease period ends, the original owner can reclaim the token. This process can be automated or manually initiated by the owner.

## Tech Stack

- **Ethereum Blockchain**: The core smart contract logic is deployed on the Ethereum network.
- **Solidity**: The smart contract for the time-limited ownership and renting system is written in Solidity.
- **React.js**: The frontend DApp is built using React.js, allowing users to interact with the smart contract via MetaMask.
- **Web3.js**: Web3.js is used to connect the React frontend to the Ethereum blockchain.

## Smart Contract

The smart contract follows the ERC721 standard with additional functionality for time-limited ownership. The key contract methods are:

- `mint`: Mint a new NFT representing a property with metadata.
- `rentToken`: Allows a user to rent the property for a specified time period.
- `activateLease`: Transfers the token to the tenant when the lease starts.
- `reclaimToken`: Reclaims the token after the lease period ends.

### Key Functions

- `rentToken`: Users can rent a property by specifying a time period and making the required payment in ETH. The contract checks for available times and ensures no double booking occurs.
- `activateLease`: Once the lease starts, the tenant can call this function (or it can be automatically called using Chainlink Keepers) to transfer the token to their wallet.
- `reclaimToken`: The original owner can reclaim their token after the lease period has ended.

## Setup Instructions

### Prerequisites

Before you start, make sure you have the following installed:

- [Node.js](https://nodejs.org/en/) (v12 or higher)
- [MetaMask](https://metamask.io/) (browser extension for Ethereum interaction)
- [Truffle](https://www.trufflesuite.com/truffle) or [Hardhat](https://hardhat.org/) (for smart contract deployment)
- [Ganache](https://www.trufflesuite.com/ganache) (for local blockchain testing)

### 1. Clone the Repository

```bash
git clone https://github.com/phonganbundau/FinalProjectBlockchain.git
cd FinalProjectBlockchain
```

### 2. Install Dependencies

```bash
cd client
npm install
```

### 3. Compile Smart Contracts

```bash
truffle compile
```

or with Hardhat:


### 4. Deploy Smart Contracts

```bash
truffle migrate --network development
```


### 5. Start the Frontend

```bash
cd client
npm start
```

### 6. Interact with the DApp

- Open your browser and connect your MetaMask wallet.
- You should be able to mint, rent, and manage your tokens.

## Future Improvements

- **Automation**: Full integration with Chainlink Keepers to automate token transfers at the start of the lease period.
- **UI Enhancements**: Further refinements to the user interface for a more seamless experience.
- **Additional Features**: Adding auction-based renting and dynamic pricing.


## Contact

For any questions or issues, feel free to open an issue or reach out via email at [your.email@example.com](mailto:your.email@example.com).
