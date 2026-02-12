# HashKey RWA TruthFlow

**Decentralized Cybersecurity Prediction Market & Red-Blue Challenge Platform**

TruthFlow is a decentralized prediction market platform built on HashKey Chain, combining AI-powered analysis and blockchain technology to verify the authenticity of Real World Assets (RWA) through a cybersecurity red-blue teaming approach.

## 🌟 Core Features

### 1. AI-Driven Risk Analysis
- **Intelligent Document Analysis**: Upload MD-formatted case documents for automatic key information extraction
- **Multi-Dimensional Risk Assessment**:
  - Sanctions list screening (companies and individuals)
  - LEI (Legal Entity Identifier) verification
  - AI Agent-powered risk analysis
- **Dynamic Odds Generation**: Automatically calculate initial market odds based on AI analysis results

### 2. Prediction Market Mechanism
- **Decentralized Trading**: Smart contract-based trading on HashKey Chain Testnet
- **Proportional Pool Model**: Security Score = yesPool / (yesPool + noPool)
- **Real-Time Probability Updates**: Market prices reflect collective intelligence
- **Fair Settlement**: On-chain verification with automatic reward distribution

### 3. Red-Blue Challenge System (On-Chain)
- **Red Team (Attack)**: Submit vulnerability evidence, exploit PoCs, risk reports
- **Blue Team (Defense)**: Submit defense evidence, mitigation strategies, audit reports
- **On-Chain Storage**: All challenges permanently stored on ChallengeArena contract
- **File Attachments**: Attach .md, .txt, .json, .sol files as evidence
- **Detail View**: Click any challenge to expand full details

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

### Smart Contract Deployment
```bash
cd contracts
npm install
cp .env.example .env  # Fill in PRIVATE_KEY
npx hardhat compile
npx hardhat run deploy.js --network hashkeyTestnet
```

## 📖 User Guide

### Creating a Target
1. Click the "NEW TARGET" button
2. Choose your method:
   - **Manual Entry**: Input title, description, companies, persons
   - **Upload MD**: Upload an MD document for AI-generated market parameters
3. AI analyzes the input (~10 minutes) and generates risk probability
4. Seed fund deposited via MetaMask (default 0.001 HSK)
5. Market created on-chain with AI-calculated odds

### Trading (Betting)
1. Select a target to view details
2. Choose your position: DEFEND (YES) or ATTACK (NO)
3. Enter HSK amount to bet
4. Confirm transaction via MetaMask
5. Security Score updates in real-time

### Red-Blue Challenge
1. Open a target's detail panel
2. Switch to RED TEAM or BLUE TEAM tab
3. Submit challenge/defense with title and evidence
4. Optionally attach files (.md, .sol, .json, etc.)
5. Click any entry to view full details
6. Reply to existing challenges

### Market Settlement
1. Market expires or admin resolves
2. Final outcome determined (YES or NO)
3. Winners claim rewards via "CLAIM REWARDS"

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Blockchain**: ethers.js v6 + HashKey Chain
- **Smart Contracts**: Solidity 0.8.20 (Hardhat)
- **AI Analysis**: Railway-hosted AI backend
- **Styling**: Tailwind CSS + Lucide Icons
- **3D Visualization**: React Three Fiber

## 📁 Project Structure

```
hashkey-rwa-truthflow/
├── components/          # React components
│   ├── AddMarketPanel.tsx      # Market creation panel
│   ├── MarketTerminal.tsx      # Trading terminal
│   ├── RedBlueChallenge.tsx    # Red-Blue challenge UI
│   ├── TabContent.tsx          # Tab content with on-chain challenges
│   ├── Dashboard.tsx           # Dashboard
│   ├── TruthUniverse.tsx       # 3D universe visualization
│   └── TutorialOverlay.tsx     # Tutorial overlay
├── services/           # Service layer
│   ├── polymarketService.ts    # Prediction market contract interactions
│   ├── challengeService.ts     # On-chain challenge read/write
│   ├── hashkeyService.ts       # Price calculation & utilities
│   ├── aiAnalysisService.ts    # AI analysis services
│   ├── contractDataService.ts  # Contract data reader
│   └── marketSyncService.ts    # Blockchain market sync
├── hooks/              # React Hooks
│   ├── useMarketManagement.ts  # Market management
│   └── useTradingOperations.ts # Trading operations
├── config/             # Configuration files
│   ├── contractConfig.ts       # TruthArenaV2 contract config
│   └── challengeConfig.ts      # ChallengeArena contract config
├── contracts/          # Smart contracts
│   ├── contracts/
│   │   ├── TruthArenaV2.sol    # Prediction market contract
│   │   └── ChallengeArena.sol  # Red-Blue challenge contract
│   ├── deploy.js               # TruthArenaV2 deploy script
│   └── deploy-challenge.js     # ChallengeArena deploy script
└── sample-events/      # Sample MD event files for testing
```

## 🔗 Smart Contract Architecture

### 1. TruthArenaV2 Contract (HashKey Chain Testnet)
**Address**: `0x71111F3b60E2f62eA306662383FcAfE2DCc8afa9`

**Features**:
- Anyone can create markets (no permission restriction)
- Seed fund split by AI-calculated odds (`_yesBasisPoints`)
- Security Score = yesPool / (yesPool + noPool)
- DEFEND bet increases Security Score, ATTACK bet decreases it

**Key Functions**:
- `createMarket(question, description, duration, yesBasisPoints)` - Create market with AI odds
- `buyYes(marketId)` - Bet on DEFEND (increases Security Score)
- `buyNo(marketId)` - Bet on ATTACK (decreases Security Score)
- `resolveMarket(marketId, outcome)` - Resolve market
- `claim(marketId)` - Claim rewards

### 2. ChallengeArena Contract (HashKey Chain Testnet)
**Address**: `0x22aC931d73351a33CeD412155999cd4945984184`

**Features**:
- On-chain storage for Red-Blue challenge data
- Users pay gas for submissions
- Supports replies (threaded conversations)
- Permanent, immutable challenge records

**Key Functions**:
- `submitChallenge(marketId, challengeType, title, evidence, replyToId)` - Submit challenge
- `getMarketChallengeCount(marketId)` - Get challenge count
- `getMarketChallengeIds(marketId)` - Get all challenge IDs
- `getChallenge(challengeId)` - Get challenge details

### Network Information

**HashKey Chain Testnet**
- **RPC URL**: https://testnet.hsk.xyz
- **Chain ID**: 133
- **Native Token**: HSK

## 🤖 AI Analysis Integration

The platform integrates AI-powered analysis for automated risk assessment:
- Automatic extraction of company and individual information
- Sanctions list screening
- LEI (Legal Entity Identifier) verification
- Risk scoring and dynamic odds generation
- AI backend hosted on Railway (`https://ai-production-1bbe.up.railway.app`)

## 🔐 Security Notes

- All transactions require MetaMask signature confirmation
- Smart contracts deployed on HashKey Chain Testnet
- Red-Blue challenge data permanently stored on-chain
- Private keys stored in `contracts/.env` (gitignored)
- No environment variables needed for frontend

## 📄 License

MIT License

---

*"In an era of deepfakes and supply chain opacity, truth is the scarcest asset."*