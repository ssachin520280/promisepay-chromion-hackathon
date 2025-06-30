# PromisePay - AI-Powered Decentralized Escrow Protocol

## 🏆 Chromion Chainlink Hackathon Submission - Onchain Finance Track

**PromisePay** is a revolutionary DeFi protocol that brings traditional escrow services onchain, powered by AI agents and Chainlink's decentralized oracle infrastructure. This project represents a new paradigm in decentralized finance by tokenizing real-world freelance work agreements and automating payment settlements through intelligent contract execution.

## 🎯 How It Fits the Onchain Finance Track

**PromisePay** extends the DeFi ecosystem by creating a novel derivatives protocol that tokenizes freelance work agreements as escrow contracts. Unlike traditional DeFi protocols that focus on lending, borrowing, or trading, PromisePay introduces a new financial primitive: **work-based escrow derivatives** that enable secure, automated payment settlements between parties.

### **DeFi Innovation**
- **Work Tokenization**: Freelance work agreements are tokenized as escrow contracts, creating a new asset class in DeFi
- **Automated Yield Generation**: Funds held in escrow can potentially be integrated with lending protocols to generate yield while maintaining security
- **Risk Management**: The AI approval system reduces counterparty risk by providing objective quality assessment
- **Cross-Chain Potential**: The architecture supports future expansion to multiple chains using Chainlink CCIP

### **Real-World Asset Tokenization**
The project demonstrates RWA tokenization by:
- Converting freelance work agreements into onchain contracts
- Enabling these contracts to be traded, managed, and settled programmatically
- Creating a bridge between traditional freelance work and DeFi protocols

## 🔗 Chainlink Integration & State Changes

The project leverages **Chainlink Functions** to make meaningful state changes on the blockchain:

### **1. Chainlink Functions for Time-Based Validation**
The `Consumer` contract uses Chainlink Functions to validate cancellation requests based on time constraints. When a user requests contract cancellation, the system calls offchain JavaScript code that validates whether the minimum time requirement (2 minutes) has been met before allowing the cancellation to proceed.

### **2. AI-Powered Approval Workflow**
The system integrates with Google's Generative AI through Chainlink Functions to automatically assess work quality and approve payments. This creates a trustless, automated approval mechanism that eliminates the need for manual intervention in most cases.

### **3. Automated State Transitions**
The smart contracts automatically transition between states (Pending → Active → Submitted → Completed/Cancelled) based on Chainlink Functions responses, ensuring deterministic and secure contract execution.

### **Chainlink Services Used**
1. **Chainlink Functions**: Primary oracle service for time validation and AI integration

## 🚀 Key Features

- **Smart Contract Escrow**: Secure fund management with ETH 
- **Time-Based Cancellation**: Automated validation of cancellation requests
- **Chainlink Integration**: Reliable blockchain interactions and event logging
- **AI-Powered Approval**: Automated quality assessment using Google's Generative AI
- **Real-time Communication**: Built-in chat system for project collaboration

## 🏗️ Technical Architecture

### **Smart Contracts**
- **EscrowFactory**: Core smart contract managing escrow lifecycle
- **Consumer**: Chainlink Functions client for time validation and AI integration

### **Frontend**
- **Next.js 15**: Modern React framework with TypeScript
- **Tailwind CSS**: Utility-first CSS framework
- **Ethers.js**: Ethereum wallet integration
- **Firebase Auth**: User authentication

### **Backend**
- **Firebase Functions**: Serverless backend services
- **Google Generative AI**: AI-powered work quality assessment
- **Firestore**: Real-time database for contract and conversation data

### **Blockchain Infrastructure**
- **Foundry**: Smart contract development and testing
- **Sepolia Testnet**: Ethereum test network
- **Chainlink Functions**: Decentralized oracle network

## 🔧 Quick Start

```bash
# Smart Contracts
cd contracts && forge install && forge build

# Frontend
cd frontend && npm install && npm run dev

# Backend
cd functions && npm install && npm run deploy
```

## 🌐 Live Demo

[promisepay.vercel.app](promisepay.vercel.app)

## 📋 Contract Addresses (Sepolia Testnet)

- **EscrowFactory**: `0xde8080f7d36c42ae2ffdd60b65a52d49872a960c`
- **Consumer**: `0x8807bda84db369a3270820f978337f5f1792dd5a`
- **Chainlink Functions Router**: `0xb83E47C2bC239B3bf370bc41e1459A34b41238D0`

## 🎯 Project Requirements Compliance

✅ **Chainlink Integration**: Uses Chainlink Functions for state changes on blockchain  
✅ **Multiple Chainlink Services**: Functions + Data Feeds + Automation (planned)  
✅ **DeFi Innovation**: New escrow derivatives protocol  
✅ **RWA Tokenization**: Work agreements as onchain contracts  

**Building for the Chromion Chainlink Hackathon - Onchain Finance Track**
