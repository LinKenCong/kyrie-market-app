# Kyrie Market App (DEV Version)

[![Solidity Version](https://img.shields.io/badge/Solidity-^0.8.0-blue.svg)](https://soliditylang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A decentralized asset trading marketplace based on the ERC6551 protocol, supporting multi-standard token trading and shop hosting system.

PS: This is currently an MVP (Minimum Viable Product) development version, not fully secure, and the code is still being optimized.

## 🌟 Core Features

### 🏪 Independent Shop System

- Create **smart contract account shops** via ERC6551 protocol
- Support for asset storage/custody/trading integrated management
- Customizable shop trading strategies

### 🛍️ Multi-Standard Support

- ERC20 token trading
- ERC721 NFT trading
- ERC1155 multi-asset trading

### 🔒 Secure Trading Mechanism

- Off-chain order signature verification (EIP-712)
- On-chain asset validity verification
- Gas-optimized transaction execution

## ⚠️ Security Considerations

Verify shop contract address before trading

Check order signature validity

Confirm asset transfer events

## 🤝 Contribution Guidelines

PRs are welcome, please follow:

Fork the repository

Create a feature branch

Submit test cases

Update documentation

Create a Pull Request

## TODO List

| Todo                                       | Status |
| :----------------------------------------- | ------ |
| Order Parameter Add "Chain Symbol"         |        |
| Optimize Hooks                             |        |
| Delete unused code                         |        |
| Multi-chain support                        |        |
| Auto-scan contract events to update status |        |
| Optimize asset data retrieval method       |        |
| Optimize asset data formatting method      |        |
| Optimize parameter type validation method  |        |
| Optimize UI                                |        |
