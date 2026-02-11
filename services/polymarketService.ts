import { ethers } from 'ethers';

declare global {
    interface Window {
        ethereum?: any;
    }
}

// TruthArenaV2 合约 ABI
const TRUTHARENA_ABI = [
    "function marketCount() view returns (uint256)",
    "function getMarket(uint256 _marketId) view returns (string question, string description, uint256 endTime, uint256 yesPool, uint256 noPool, uint256 totalYesShares, uint256 totalNoShares, uint8 status, uint8 outcome, uint256 seedFund)",
    "function createMarket(string memory _question, string memory _description, uint256 _duration, uint256 _yesBasisPoints) payable returns (uint256)",
    "function placeBet(uint256 _marketId, bool _prediction) payable",
    "function getPrices(uint256 _marketId) view returns (uint256 yesPrice, uint256 noPrice)",
    "function getPosition(uint256 _marketId, address _user) view returns (uint256 yesShares, uint256 noShares, uint256 yesCost, uint256 noCost)",
    "function calculatePotentialPayout(uint256 _marketId, uint256 _amount, bool _isYes) view returns (uint256)",
    "function claimReward(uint256 _marketId)",
    "function resolveMarket(uint256 _marketId, uint8 _outcome, bytes32 _txHash)",
    "function cancelMarket(uint256 _marketId)",
    "function claimRefund(uint256 _marketId)",
    "function owner() view returns (address)",
    "function collectedFees() view returns (uint256)",
    "function hasClaimed(uint256, address) view returns (bool)",
    "event MarketCreated(uint256 indexed marketId, string question, uint256 endTime, address indexed creator, uint256 seedFund)",
    "event BetPlaced(uint256 indexed marketId, address indexed user, bool prediction, uint256 amount, uint256 shares)",
    "event MarketResolved(uint256 indexed marketId, uint8 outcome, bytes32 txHash)",
    "event RewardClaimed(uint256 indexed marketId, address indexed user, uint256 amount)",
    "event MarketCancelled(uint256 indexed marketId)"
];

// HashKey Chain Testnet 网络配置
const HASHKEY_TESTNET_CONFIG = {
    chainId: '0x85', // 133
    chainName: 'HashKey Chain Testnet',
    nativeCurrency: {
        name: 'HSK',
        symbol: 'HSK',
        decimals: 18
    },
    rpcUrls: ['https://testnet.hsk.xyz'],
    blockExplorerUrls: ['https://testnet-explorer.hsk.xyz']
};

/**
 * PolymarketService - 管理预测市场合约交互（HashKey Chain Testnet）
 */
export class PolymarketService {
    private provider: ethers.BrowserProvider | null = null;
    private signer: ethers.Signer | null = null;
    private contract: ethers.Contract | null = null;
    private contractAddress: string;
    private userAddress: string | null = null;

    constructor(contractAddress: string = '0x71111F3b60E2f62eA306662383FcAfE2DCc8afa9') {
        this.contractAddress = contractAddress;
    }

    /**
     * 连接钱包并初始化合约
     */
    async connect(): Promise<{ success: boolean; address?: string; error?: string }> {
        try {
            if (!window.ethereum) {
                return { success: false, error: 'Please install MetaMask!' };
            }

            this.provider = new ethers.BrowserProvider(window.ethereum);
            
            // 请求账户访问
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.userAddress = accounts[0];
            
            // 获取 signer
            this.signer = await this.provider.getSigner();
            
            // 检查并切换到 HashKey Chain Testnet
            const network = await this.provider.getNetwork();
            if (network.chainId !== BigInt(133)) {
                await this.switchToHashKeyTestnet();
                
                // 网络切换后重新获取 provider 和 signer
                this.provider = new ethers.BrowserProvider(window.ethereum);
                this.signer = await this.provider.getSigner();
            }
            
            // 创建合约实例
            this.contract = new ethers.Contract(
                this.contractAddress,
                TRUTHARENA_ABI,
                this.signer
            );

            console.log('✅ TruthArenaV2 connected:', this.userAddress);
            return { success: true, address: this.userAddress };

        } catch (error: any) {
            console.error('❌ TruthArenaV2 connection failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 切换到 HashKey Chain Testnet
     */
    async switchToHashKeyTestnet(): Promise<void> {
        try {
            // 先尝试添加/更新网络配置（确保 nativeCurrency 为 HSK）
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [HASHKEY_TESTNET_CONFIG],
            });
        } catch (addError: any) {
            // 如果网络已存在，MetaMask 会自动切换，忽略错误
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: HASHKEY_TESTNET_CONFIG.chainId }],
                });
            } catch (switchError: any) {
                throw switchError;
            }
        }
    }

    /**
     * 创建市场
     * @param question 市场问题
     * @param closeTime 关闭时间（Unix 时间戳）
     * @param seedFundHSK 种子资金（HSK），默认 0.01
     */
    async createMarket(question: string, closeTime: number, seedFundHSK: string = '0.01', yesBasisPoints: number = 5000): Promise<{ 
        success: boolean; 
        marketId?: number; 
        txHash?: string; 
        error?: string 
    }> {
        try {
            if (!this.contract) {
                await this.connect();
            }

            if (!this.contract) {
                return { success: false, error: 'Contract not initialized' };
            }

            // 计算 duration（从现在到 closeTime 的秒数）
            const now = Math.floor(Date.now() / 1000);
            const duration = closeTime - now;
            
            if (duration <= 0) {
                return { success: false, error: 'Close time must be in the future' };
            }

            // 确保 yesBasisPoints 在有效范围内 (1-9999)
            const validYesBP = Math.max(1, Math.min(9999, Math.round(yesBasisPoints)));

            console.log(`📝 Creating market: ${question}`);
            console.log(`   seed fund: ${seedFundHSK} HSK, parsed: ${ethers.parseEther(seedFundHSK).toString()} wei`);
            console.log(`   duration: ${duration}s, yesBasisPoints: ${validYesBP}`);
            
            const tx = await this.contract.createMarket(
                question,
                '',  // description
                duration,
                validYesBP,
                { value: ethers.parseEther(seedFundHSK) }
            );
            const receipt = await tx.wait();

            // 从事件中获取 marketId
            const event = receipt.logs.find((log: any) => {
                try {
                    const parsed = this.contract!.interface.parseLog(log);
                    return parsed?.name === 'MarketCreated';
                } catch {
                    return false;
                }
            });

            let marketId = 0;
            if (event) {
                const parsed = this.contract.interface.parseLog(event);
                marketId = Number(parsed?.args[0]);
            }

            console.log(`✅ Market created: ID ${marketId}, TX: ${receipt.hash}`);

            return { 
                success: true, 
                marketId,
                txHash: receipt.hash 
            };

        } catch (error: any) {
            console.error('❌ Create market failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 获取市场详情
     * @param marketId 市场ID
     */
    async getMarket(marketId: number): Promise<any> {
        try {
            if (!this.contract) return null;

            const market = await this.contract.getMarket(marketId);

            return {
                id: marketId,
                question: market[0],
                description: market[1],
                closeTime: Number(market[2]),
                yesPool: Number(ethers.formatEther(market[3])),
                noPool: Number(ethers.formatEther(market[4])),
                totalYesShares: Number(market[5]),
                totalNoShares: Number(market[6]),
                status: Number(market[7]),
                outcome: Number(market[8]),
                seedFund: Number(ethers.formatEther(market[9]))
            };

        } catch (error) {
            console.error('Get market failed:', error);
            return null;
        }
    }

    /**
     * 下注（购买 YES 或 NO）
     * @param marketId 市场ID
     * @param prediction true=YES, false=NO
     * @param amountHSK 下注金额（HSK）
     */
    async placeBet(marketId: number, prediction: boolean, amountHSK: string): Promise<{ 
        success: boolean; 
        txHash?: string; 
        error?: string 
    }> {
        try {
            if (!this.contract) {
                return { success: false, error: 'Contract not initialized' };
            }

            console.log(`${prediction ? '📈' : '�'} Placing ${prediction ? 'YES' : 'NO'} bet: ${amountHSK} HSK`);
            
            const tx = await this.contract.placeBet(marketId, prediction, { 
                value: ethers.parseEther(amountHSK) 
            });
            const receipt = await tx.wait();

            console.log(`✅ Bet placed: TX ${receipt.hash}`);

            return { 
                success: true, 
                txHash: receipt.hash 
            };

        } catch (error: any) {
            console.error('❌ Place bet failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 购买 YES 份额（兼容旧接口）
     */
    async buyYes(marketId: number, sharesToBuy: number): Promise<{ 
        success: boolean; 
        txHash?: string; 
        error?: string 
    }> {
        const amountHSK = (sharesToBuy * 0.001).toString();
        return this.placeBet(marketId, true, amountHSK);
    }

    /**
     * 购买 NO 份额（兼容旧接口）
     */
    async buyNo(marketId: number, sharesToBuy: number): Promise<{ 
        success: boolean; 
        txHash?: string; 
        error?: string 
    }> {
        const amountHSK = (sharesToBuy * 0.001).toString();
        return this.placeBet(marketId, false, amountHSK);
    }

    /**
     * 获取用户份额
     * @param marketId 市场ID
     * @param userAddress 用户地址
     */
    async getUserShares(marketId: number, userAddress: string): Promise<{
        yesShares: number;
        noShares: number;
    }> {
        try {
            // 如果合约未初始化，创建只读provider
            if (!this.contract) {
                const provider = new ethers.JsonRpcProvider('https://testnet.hsk.xyz');
                this.contract = new ethers.Contract(this.contractAddress, TRUTHARENA_ABI, provider);
            }

            const position = await this.contract.getPosition(marketId, userAddress);

            return {
                yesShares: Number(ethers.formatEther(position[0])),
                noShares: Number(ethers.formatEther(position[1]))
            };

        } catch (error) {
            console.error('[getUserShares] Error:', error);
            return { yesShares: 0, noShares: 0 };
        }
    }

    /**
     * 领取奖励
     * @param marketId 市场ID
     */
    async claim(marketId: number): Promise<{ 
        success: boolean; 
        amount?: number;
        txHash?: string; 
        error?: string 
    }> {
        try {
            if (!this.contract) {
                return { success: false, error: 'Contract not initialized' };
            }

            console.log(`💰 Claiming rewards for market ${marketId}`);
            
            const tx = await this.contract.claimReward(marketId);
            const receipt = await tx.wait();

            // 从事件中获取奖励金额
            const event = receipt.logs.find((log: any) => {
                try {
                    const parsed = this.contract!.interface.parseLog(log);
                    return parsed?.name === 'RewardClaimed';
                } catch {
                    return false;
                }
            });

            let amount = 0;
            if (event) {
                const parsed = this.contract.interface.parseLog(event);
                amount = Number(ethers.formatEther(parsed?.args[2]));
            }

            console.log(`✅ Rewards claimed: ${amount} HSK, TX: ${receipt.hash}`);

            return { 
                success: true,
                amount,
                txHash: receipt.hash 
            };

        } catch (error: any) {
            console.error('❌ Claim failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 获取用户地址
     */
    getUserAddress(): string | null {
        return this.userAddress;
    }

    /**
     * 解决市场
     * @param outcome 1=Yes, 2=No
     */
    async resolveMarket(marketId: number, outcome: boolean): Promise<void> {
        try {
            if (!this.contract || !this.signer) {
                throw new Error('Contract not initialized. Call connect() first.');
            }

            console.log(`Resolving market ${marketId} with outcome: ${outcome}`);

            // outcome: 1=Yes, 2=No
            const outcomeValue = outcome ? 1 : 2;
            const txHash = ethers.keccak256(
                ethers.toUtf8Bytes(`market-${marketId}-${Date.now()}`)
            );

            const tx = await this.contract.resolveMarket(marketId, outcomeValue, txHash);
            console.log('Transaction sent:', tx.hash);

            const receipt = await tx.wait();
            console.log('Market resolved! Transaction:', receipt.hash);
        } catch (error) {
            console.error('Failed to resolve market:', error);
            throw error;
        }
    }

    /**
     * 领取奖励（兼容旧接口）
     */
    async claimRewards(marketId: number): Promise<string> {
        try {
            const result = await this.claim(marketId);
            return result.amount?.toString() || '0';
        } catch (error) {
            console.error('Failed to claim rewards:', error);
            throw error;
        }
    }

    /**
     * 取消市场（仅管理员）
     */
    async cancelMarket(marketId: number): Promise<void> {
        try {
            if (!this.contract || !this.signer) {
                throw new Error('Contract not initialized. Call connect() first.');
            }

            console.log(`Cancelling market ${marketId}`);

            const tx = await this.contract.cancelMarket(marketId);
            console.log('Transaction sent:', tx.hash);

            const receipt = await tx.wait();
            console.log('Market cancelled! Transaction:', receipt.hash);
        } catch (error) {
            console.error('Failed to cancel market:', error);
            throw error;
        }
    }
}

// 导出单例实例
export const polymarketService = new PolymarketService();
