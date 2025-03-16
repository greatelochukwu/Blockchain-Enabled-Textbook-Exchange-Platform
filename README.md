# Blockchain-Enabled Textbook Exchange Platform

A decentralized platform that connects students to exchange textbooks using blockchain technology for security, transparency, and trust.

## Overview

This platform leverages blockchain technology to create a trustless textbook exchange ecosystem for students. By using smart contracts to handle book registration, condition verification, exchange matching, and reputation tracking, we eliminate intermediaries and reduce costs while maintaining high levels of trust and transparency.

## Smart Contracts

### 1. Book Registration Contract

The foundational contract that stores essential details about textbooks available for exchange:

- ISBN identification
- Title and author information
- Edition and publication year
- Current owner's wallet address
- Pricing information
- Availability status

### 2. Condition Verification Contract

Ensures quality control through:

- Standardized condition ratings (New, Excellent, Good, Fair, Poor)
- Photo verification hash storage
- Dispute resolution mechanisms
- Third-party verification options
- Condition history tracking

### 3. Exchange Matching Contract

Facilitates efficient textbook exchanges by:

- Matching textbook requests with available inventory
- Managing escrow functionality for secure transactions
- Automating exchange logistics
- Handling partial matches and waitlisting
- Processing payment settlements

### 4. Reputation System Contract

Builds trust within the ecosystem by:

- Recording transaction history
- Managing user ratings and reviews
- Calculating reputation scores
- Implementing anti-fraud measures
- Providing incentives for positive behavior

## Getting Started

### Prerequisites

- MetaMask or compatible Web3 wallet
- Basic understanding of blockchain transactions
- Student email verification (for campus-specific exchanges)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/blockchain-textbook-exchange.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure your environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your blockchain network settings

4. Deploy smart contracts:
   ```
   truffle migrate --network [your-network]
   ```

5. Start the application:
   ```
   npm start
   ```

## Usage

1. **Register a Textbook**
    - Connect your wallet
    - Enter book details (ISBN, condition, asking price)
    - Upload verification photos
    - Confirm transaction to mint your book NFT

2. **Find a Textbook**
    - Search by course code, ISBN, or title
    - Browse available options filtered by condition and price
    - View seller reputation and book verification status

3. **Complete an Exchange**
    - Initiate purchase/exchange request
    - Funds are held in escrow
    - Arrange physical exchange or delivery
    - Confirm receipt and release payment
    - Rate the transaction

## Architecture

The platform uses a hybrid architecture:

- Smart contracts on Ethereum/compatible blockchain
- IPFS for storing verification photos
- Off-chain database for search optimization
- Web3.js for frontend blockchain interaction
- React frontend for user interface

## Security Considerations

- Multi-signature requirements for high-value transactions
- Gradual escrow release mechanisms
- Rate limiting to prevent market manipulation
- Identity verification through campus email domains
- Circuit breakers for emergency shutdown

## Development Roadmap

- **Phase 1:** Core smart contracts and basic UI
- **Phase 2:** Mobile application and expanded verification options
- **Phase 3:** Multi-campus integration and cross-platform support
- **Phase 4:** Implementation of governance token for platform evolution

## Contributing

We welcome contributions from the community. Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

- Project Team: team@textchainexchange.io
- Discord: [Join our community](https://discord.gg/textchainexchange)
- Twitter: [@TextChainEx](https://twitter.com/TextChainEx)

---

Built with ❤️ for students, by students
