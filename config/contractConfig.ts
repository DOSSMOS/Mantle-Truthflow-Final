// 智能合约配置
export const CONTRACT_CONFIG = {
    // 网络配置
    NETWORKS: {
        HASHKEY_TESTNET: {
            chainId: '0x85', // 133
            chainName: 'HashKey Chain Testnet',
            rpcUrls: ['https://testnet.hsk.xyz'],
            nativeCurrency: {
                name: 'HSK',
                symbol: 'HSK',
                decimals: 18
            },
            blockExplorerUrls: ['https://testnet-explorer.hsk.xyz']
        },
        HASHKEY_MAINNET: {
            chainId: '0xB1', // 177
            chainName: 'HashKey Chain',
            rpcUrls: ['https://mainnet.hsk.xyz'],
            nativeCurrency: {
                name: 'HSK',
                symbol: 'HSK',
                decimals: 18
            },
            blockExplorerUrls: ['https://hashkey.blockscout.com']
        },
        LOCALHOST: {
            chainId: '0x7A69', // 31337
            chainName: 'Hardhat Local',
            rpcUrls: ['http://127.0.0.1:8545'],
            nativeCurrency: {
                name: 'HSK',
                symbol: 'HSK',
                decimals: 18
            }
        }
    },

    // 默认网络
    DEFAULT_NETWORK: 'HASHKEY_TESTNET',

    // HashKey Chain Testnet 合约地址
    POLYMARKET_CONTRACT_ADDRESS: '0x71111F3b60E2f62eA306662383FcAfE2DCc8afa9',

    // 合约 ABI
    CONTRACT_ABI: [
        "function marketCount() view returns (uint256)",
        "function getMarket(uint256 marketId) view returns (string question, string description, uint256 endTime, uint256 yesPool, uint256 noPool, uint256 totalYesShares, uint256 totalNoShares, uint8 status, uint8 outcome, uint256 seedFund)",
        "function createMarket(string memory _question, string memory _description, uint256 _duration, uint256 _yesBasisPoints) payable returns (uint256)",
        "function placeBet(uint256 _marketId, bool _prediction) payable",
        "function getPrices(uint256 _marketId) view returns (uint256 yesPrice, uint256 noPrice)",
        "function getPosition(uint256 _marketId, address _user) view returns (uint256 yesShares, uint256 noShares, uint256 yesCost, uint256 noCost)",
        "function calculatePotentialPayout(uint256 _marketId, uint256 _amount, bool _isYes) view returns (uint256)",
        "function claimReward(uint256 _marketId)",
        "function resolveMarket(uint256 _marketId, uint8 _outcome, bytes32 _txHash)",
        "function owner() view returns (address)",
        "function collectedFees() view returns (uint256)",
        "event MarketCreated(uint256 indexed marketId, string question, uint256 endTime, address indexed creator, uint256 seedFund)",
        "event BetPlaced(uint256 indexed marketId, address indexed user, bool prediction, uint256 amount, uint256 shares)",
        "event MarketResolved(uint256 indexed marketId, uint8 outcome, bytes32 txHash)",
        "event RewardClaimed(uint256 indexed marketId, address indexed user, uint256 amount)"
    ]
};

// 市场状态枚举
export enum MarketStatus {
    ACTIVE = 0,
    CLOSED = 1,
    RESOLVED = 2,
    CANCELLED = 3
}

// 辅助函数
export const contractUtils = {
    // 格式化地址
    formatAddress: (address: string): string => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },

    // 格式化金额
    formatAmount: (amount: string | number, decimals: number = 4): string => {
        if (!amount) return '0';
        const num = parseFloat(amount.toString());
        return num.toFixed(decimals);
    },

    // 格式化时间
    formatTime: (timestamp: number): string => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('zh-CN');
    },

    // 计算时间差
    getTimeRemaining: (endTime: number): string => {
        const now = Math.floor(Date.now() / 1000);
        const diff = endTime - now;
        
        if (diff <= 0) return '已结束';
        
        const days = Math.floor(diff / 86400);
        const hours = Math.floor((diff % 86400) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        
        if (days > 0) return `${days}天 ${hours}小时`;
        if (hours > 0) return `${hours}小时 ${minutes}分钟`;
        return `${minutes}分钟`;
    }
};
