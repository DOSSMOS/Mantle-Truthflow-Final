# Mantle RWA TruthFlow

**Decentralized Prediction Market for RWA Authenticity Verification**

TruthFlow is a decentralized prediction market platform built on Mantle Network, combining AI-powered analysis and blockchain technology to verify the authenticity of Real World Assets (RWA).

## 🌟 Core Features

### 1. AI-Driven Risk Analysis
- **Intelligent Document Analysis**: Upload MD-formatted case documents for automatic key information extraction
- **Multi-Dimensional Risk Assessment**:
  - Sanctions list screening (companies and individuals)
  - LEI (Legal Entity Identifier) verification
  - AI Agent-powered risk analysis
- **Dynamic Odds Generation**: Automatically calculate initial market odds based on AI analysis results

### 2. Prediction Market Mechanism
- **Decentralized Trading**: Smart contract-based trading on Mantle Sepolia Network
- **Automated Market Maker (AMM)**: Dynamic pricing using LMSR algorithm
- **Real-Time Probability Updates**: Market prices reflect collective intelligence
- **Fair Settlement**: On-chain verification with automatic reward distribution

### 3. Dual-Chain Architecture
- **Mantle Sepolia**: Prediction market trading (using MNT)
- **Ethereum Sepolia**: Deposit management and yield generation (using ETH)

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Local Development
```bash
npm run dev
```
Access at: http://localhost:3000

### Production Build
```bash
npm run build
```

## 📖 User Guide

### Creating a Market
1. Click the "CREATE NEW MARKET" button
2. Choose your method:
   - **Manual Entry**: Input title, description, and initial liquidity pools
   - **AI Analysis**: Upload an MD document for AI-generated market parameters
3. Set deposit amount (optional)
4. Confirm creation and wait for on-chain confirmation

### Trading Operations
1. Select a market to view details
2. Choose your position: DEFEND (YES) or ATTACK (NO)
3. Enter trade amount
4. Confirm transaction via MetaMask signature
5. Wait for transaction confirmation

### Market Settlement
1. Market expires or admin manually resolves
2. Final outcome determined (YES or NO)
3. Winners can claim rewards
4. Click "CLAIM REWARDS" to collect earnings

## 🛠️ Tech Stack

- **Frontend Framework**: React + TypeScript + Vite
- **Blockchain Integration**: ethers.js v6
- **Smart Contracts**: Solidity (Mantle Sepolia)
- **AI Analysis**: Tencent Yuanqi AI Agent
- **Styling**: Tailwind CSS + Lucide Icons
- **3D Visualization**: React Three Fiber

## 📁 Project Structure

```
cybersecurity-copy-of-mantle-truthflow/
├── components/          # React components
│   ├── AddMarketPanel.tsx      # Market creation panel
│   ├── MarketTerminal.tsx      # Trading terminal
│   ├── Dashboard.tsx           # Dashboard
│   └── ...
├── services/           # Service layer
│   ├── polymarketService.ts    # Prediction market contract interactions
│   ├── paymentService.ts       # Payment services
│   ├── aiAnalysisService.ts    # AI analysis services
│   └── ...
├── hooks/              # React Hooks
│   ├── useMarketManagement.ts  # Market management
│   └── useTradingOperations.ts # Trading operations
├── config/             # Configuration files
│   ├── contractConfig.ts       # Contract configuration
│   └── systemWallet.ts         # System wallet configuration
├── contracts/          # Smart contracts
└── dist/              # Build output
```

## 🔗 Smart Contract Architecture

The project employs a **dual-chain, three-contract architecture** to separate prediction markets from asset management:

### 1. PolymarketL1 Contract (Mantle Sepolia)
**Address**: `0x76fe9c7fA93afF8053FFfBD9995A611B49eb5C6F`

**Core Functions**:
- **Market Creation**: Create prediction markets with questions and closing times
- **Automated Market Maker (AMM)**: Dynamic pricing using LMSR algorithm
- **Share Trading**: Buy/sell YES/NO shares
- **Market Resolution**: Admin resolves markets and determines final outcomes
- **Reward Distribution**: Winners claim rewards

**Key Functions**:
- `createMarket(question, closeTime)` - Create a new market
- `buyYes(marketId, shares)` - Purchase YES shares
- `buyNo(marketId, shares)` - Purchase NO shares
- `resolveMarket(marketId, outcome)` - Resolve market outcome
- `claim(marketId)` - Claim rewards

### 2. DepositManager Contract (Ethereum Sepolia)
**Address**: `0xD9eB252A74057965600025023da1bDC51dE3d158`

**Core Functions**:
- **Deposit Management**: Accept user ETH deposits
- **Yield Generation**: Simulate DeFi yields (Aave/Compound)
- **Deposit Withdrawal**: Withdraw deposits and yields after market settlement

**Key Functions**:
- `createDeposit(marketId)` - Create a deposit
- `withdrawDeposit(depositId)` - Withdraw deposit and yields
- `getDepositInfo(depositId)` - Query deposit information

### 3. TransformationRegistry Contract (Mantle Sepolia)
**Address**: `0x22aC931d73351a33CeD412155999cd4945984184`

**Core Functions**:
- **Asset Transformation Records**: Record RWA asset transformation history
- **Provenance Verification**: Provide asset origin and transformation path queries
- **Transparency Guarantee**: All transformation records on-chain and immutable

**Key Functions**:
- `recordTransformation(assetId, fromState, toState)` - Record transformation
- `getTransformationHistory(assetId)` - Query history
- `verifyTransformation(assetId, transformationId)` - Verify transformation

### Network Information

**Mantle Sepolia**
- **RPC URL**: https://rpc.sepolia.mantle.xyz
- **Block Explorer**: https://explorer.sepolia.mantle.xyz
- **Chain ID**: 5003

**Ethereum Sepolia**
- **RPC URL**: https://rpc.sepolia.org
- **Block Explorer**: https://sepolia.etherscan.io
- **Chain ID**: 11155111

## 🤖 AI Analysis Integration

The platform integrates AI-powered analysis for automated risk assessment:
- Automatic extraction of company and individual information
- Sanctions list screening
- LEI (Legal Entity Identifier) verification
- Risk scoring and dynamic odds generation

## 🔐 Security Notes

- All transactions require MetaMask signature confirmation
- Smart contracts deployed on testnets
- Deposits and rewards managed through on-chain contracts
- Private keys and sensitive information should never be hardcoded

## 📄 License

MIT License

---

*"In an era of deepfakes and supply chain opacity, truth is the scarcest asset."*
