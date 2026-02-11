import { ethers } from 'ethers';
import { CHALLENGE_CONTRACT_ADDRESS, CHALLENGE_ABI } from '../config/challengeConfig';

const RPC_URL = 'https://testnet.hsk.xyz';

export interface OnChainChallenge {
  id: number;
  marketId: number;
  type: 'red' | 'blue';
  author: string;
  title: string;
  evidence: string;
  timestamp: Date;
  replyToId: number;
  replies?: OnChainChallenge[];
}

class ChallengeService {
  private readProvider: ethers.JsonRpcProvider;
  private readContract: ethers.Contract;

  constructor() {
    this.readProvider = new ethers.JsonRpcProvider(RPC_URL);
    this.readContract = new ethers.Contract(CHALLENGE_CONTRACT_ADDRESS, CHALLENGE_ABI, this.readProvider);
  }

  /**
   * Get a signer-connected contract for write operations
   */
  private async getWriteContract(): Promise<ethers.Contract> {
    if (!window.ethereum) throw new Error('MetaMask not found');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CHALLENGE_CONTRACT_ADDRESS, CHALLENGE_ABI, signer);
  }

  /**
   * Submit a challenge/defense on-chain (user pays gas)
   */
  async submitChallenge(
    marketId: number,
    isRed: boolean,
    title: string,
    evidence: string,
    replyToId: number = 0
  ): Promise<{ success: boolean; challengeId?: number; txHash?: string; error?: string }> {
    try {
      const contract = await this.getWriteContract();
      console.log(`⚔️ Submitting ${isRed ? 'RED challenge' : 'BLUE defense'} for market #${marketId}`);

      const tx = await contract.submitChallenge(marketId, isRed, title, evidence, replyToId);
      const receipt = await tx.wait();

      // Parse event to get challengeId
      let challengeId = 0;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed?.name === 'ChallengeSubmitted') {
            challengeId = Number(parsed.args[0]);
            break;
          }
        } catch { /* skip */ }
      }

      console.log(`✅ Challenge submitted: ID ${challengeId}, TX: ${receipt.hash}`);
      return { success: true, challengeId, txHash: receipt.hash };
    } catch (error: any) {
      console.error('❌ Submit challenge failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load all challenges for a market from chain
   */
  async getMarketChallenges(marketId: number): Promise<OnChainChallenge[]> {
    try {
      const count = await this.readContract.getMarketChallengeCount(marketId);
      const total = Number(count);
      if (total === 0) return [];

      // Get all challenge IDs
      const ids: number[] = [];
      const batchSize = 50;
      for (let offset = 0; offset < total; offset += batchSize) {
        const batch = await this.readContract.getMarketChallengeIds(marketId, offset, batchSize);
        ids.push(...batch.map((id: bigint) => Number(id)));
      }

      // Fetch each challenge
      const challenges: OnChainChallenge[] = [];
      for (const id of ids) {
        const c = await this.readContract.getChallenge(id);
        challenges.push({
          id: Number(c.id),
          marketId: Number(c.marketId),
          type: Number(c.cType) === 0 ? 'red' : 'blue',
          author: c.author,
          title: c.title,
          evidence: c.evidence,
          timestamp: new Date(Number(c.timestamp) * 1000),
          replyToId: Number(c.replyToId)
        });
      }

      return challenges;
    } catch (error) {
      console.error('Failed to load challenges:', error);
      return [];
    }
  }
}

export const challengeService = new ChallengeService();
