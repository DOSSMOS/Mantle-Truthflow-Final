/**
 * 合约数据同步服务
 * 从新合约读取市场数据
 */

import { ethers } from 'ethers';
import { Market } from '../types';

const CONTRACT_ADDRESS = '0x71111F3b60E2f62eA306662383FcAfE2DCc8afa9';
const RPC_URL = 'https://testnet.hsk.xyz';

const CONTRACT_ABI = [
    "function marketCount() view returns (uint256)",
    "function markets(uint256) view returns (string question, string description, uint256 endTime, uint256 yesPool, uint256 noPool, uint256 totalYesShares, uint256 totalNoShares, uint8 status, uint8 outcome, bytes32 verifiedTxHash, uint256 createdAt, address creator, uint256 seedFund)"
];

// 市场标题到中文标题的映射
const TITLE_CN_MAP: Record<string, string> = {
    'Target: Lithium Reserve #L-992': '目标：锂矿储备 #L-992',
    'Target: GPU Cluster Rent-Fi': '目标：GPU集群租赁协议',
    'Target: CBAM Carbon Credits': '目标：CBAM碳信用额度',
    'Target: Cold Chain Logistics': '目标：冷链物流',
    '1': '测试市场1'
};

// 市场标题到描述的映射
const DESCRIPTION_MAP: Record<string, string> = {
    'Target: Lithium Reserve #L-992': 'Security audit of Lithium Reserve tokenization protocol',
    'Target: GPU Cluster Rent-Fi': 'Security audit of GPU rental DeFi protocol',
    'Target: CBAM Carbon Credits': 'Security audit of Carbon Border Adjustment Mechanism credits',
    'Target: Cold Chain Logistics': 'Security audit of cold chain supply tracking protocol',
    '1': 'Test market with trading activity'
};

// 市场标题到RWA类型的映射
const RWA_TYPE_MAP: Record<string, 'Infra' | 'Energy' | 'SupplyChain' | 'Finance'> = {
    'Target: Lithium Reserve #L-992': 'Energy',
    'Target: GPU Cluster Rent-Fi': 'Infra',
    'Target: CBAM Carbon Credits': 'Energy',
    'Target: Cold Chain Logistics': 'SupplyChain',
    '1': 'Finance'
};

// 市场标题到图标的映射
const ICON_MAP: Record<string, string> = {
    'Target: Lithium Reserve #L-992': '⚡',
    'Target: GPU Cluster Rent-Fi': '🖥️',
    'Target: CBAM Carbon Credits': '🌱',
    'Target: Cold Chain Logistics': '📦',
    '1': '💰'
};

class ContractDataService {
    private provider: ethers.JsonRpcProvider;
    private contract: ethers.Contract;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(RPC_URL);
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.provider);
    }

    /**
     * 从合约读取所有市场数据
     */
    async loadMarketsFromContract(): Promise<Market[]> {
        try {
            console.log('📡 从合约读取市场数据...');
            
            const count = await this.contract.marketCount();
            console.log(`📊 合约上共有 ${count} 个市场`);
            
            const markets: Market[] = [];
            
            for (let i = 0; i < Number(count); i++) {
                try {
                    const marketData = await this.contract.markets(i);
                    const statusNum = Number(marketData.status);
                    
                    // 跳过已删除的市场
                    if (statusNum === 2) { // CANCELLED
                        console.log(`⏭️  跳过已删除的市场 #${i}`);
                        continue;
                    }
                    
                    const title = marketData.question;
                    const yesPool = Number(ethers.formatEther(marketData.yesPool));
                    const noPool = Number(ethers.formatEther(marketData.noPool));
                    const createdAt = Number(marketData.createdAt);
                    const seedFund = Number(ethers.formatEther(marketData.seedFund));
                    
                    const market: Market = {
                        id: i,
                        title: title,
                        titleCN: TITLE_CN_MAP[title] || title,
                        description: DESCRIPTION_MAP[title] || 'Security audit prediction market',
                        rwaType: RWA_TYPE_MAP[title] || 'Finance',
                        yesPool: yesPool,
                        noPool: noPool,
                        resolved: statusNum === 1, // RESOLVED
                        outcome: marketData.outcome,
                        history: [
                            { timestamp: createdAt, probYes: 0.5 },
                            { timestamp: Math.floor(Date.now() / 1000), probYes: yesPool / (yesPool + noPool + 0.0001) }
                        ],
                        imageUrl: '',
                        activeSyndicates: [],
                        hasZeroDayOffer: false,
                        depositAmount: 0,
                        yieldEnabled: false,
                        accumulatedYield: 0,
                        createdAt: createdAt,
                        depositId: 0,
                        depositWithdrawn: false,
                        creator: marketData.creator,
                        category: RWA_TYPE_MAP[title] || 'Finance',
                        icon: ICON_MAP[title] || '🎯',
                        duration: 86400
                    };
                    
                    markets.push(market);
                    console.log(`✅ 加载市场 #${i}: ${title}`);
                    
                } catch (error) {
                    console.error(`❌ 无法读取市场 #${i}:`, error);
                }
            }
            
            console.log(`✅ 成功加载 ${markets.length} 个市场`);
            return markets;
            
        } catch (error) {
            console.error('❌ 从合约加载市场失败:', error);
            return [];
        }
    }

    /**
     * 获取单个市场的最新数据
     */
    async getMarketData(marketId: number): Promise<Market | null> {
        try {
            const marketData = await this.contract.markets(marketId);
            const statusNum = Number(marketData.status);
            
            if (statusNum === 2) { // CANCELLED
                return null;
            }
            
            const title = marketData.question;
            const yesPool = Number(ethers.formatEther(marketData.yesPool));
            const noPool = Number(ethers.formatEther(marketData.noPool));
            
            return {
                id: marketId,
                title: title,
                titleCN: TITLE_CN_MAP[title] || title,
                description: DESCRIPTION_MAP[title] || 'Security audit prediction market',
                rwaType: RWA_TYPE_MAP[title] || 'Finance',
                yesPool: yesPool,
                noPool: noPool,
                resolved: statusNum === 1,
                outcome: marketData.outcome,
                history: [
                    { timestamp: Number(marketData.createdAt), probYes: 0.5 },
                    { timestamp: Math.floor(Date.now() / 1000), probYes: yesPool / (yesPool + noPool + 0.0001) }
                ],
                imageUrl: '',
                activeSyndicates: [],
                hasZeroDayOffer: false,
                depositAmount: 0,
                yieldEnabled: false,
                accumulatedYield: 0,
                createdAt: Number(marketData.createdAt),
                depositId: 0,
                depositWithdrawn: false,
                creator: marketData.creator,
                category: RWA_TYPE_MAP[title] || 'Finance',
                icon: ICON_MAP[title] || '🎯',
                duration: 86400
            };
            
        } catch (error) {
            console.error(`❌ 获取市场 #${marketId} 数据失败:`, error);
            return null;
        }
    }
}

export const contractDataService = new ContractDataService();
