import { Market, Outcome } from '../types';
import { calculateProbability } from '../services/mantleService';
import { polymarketService } from '../services/polymarketService';
// deposit 功能已移除（HashKey Chain 上无 DepositManager）

export const useTradingOperations = (
  markets: Market[],
  setMarkets: React.Dispatch<React.SetStateAction<Market[]>>,
  addToTicker: (msg: string) => void,
  refreshBalance: () => void,
  useBlockchain: boolean
) => {
  /**
   * 用户交易（链上）
   */
  const handleUserTrade = async (marketId: number, direction: Outcome, amount: number, userBalance: number) => {
    // 不再检查余额限制，让合约自己处理
    
    try {
      if (useBlockchain) {
        addToTicker(`[SYSTEM] Submitting trade to blockchain...`);
        
        // amount 就是用户输入的 HSK 金额
        const amountHSK = amount.toString();
        const result = direction === Outcome.YES 
          ? await polymarketService.placeBet(marketId, true, amountHSK)
          : await polymarketService.placeBet(marketId, false, amountHSK);
        
        if (result.success) {
          addToTicker(`[SUCCESS] Trade confirmed: ${result.txHash?.slice(0, 20)}...`);
          
          const marketData = await polymarketService.getMarket(marketId);
          if (marketData) {
            setMarkets(prevMarkets => prevMarkets.map(m => 
              m.id === marketId ? {
                ...m,
                yesPool: marketData.yesPool,
                noPool: marketData.noPool,
                history: [...m.history, { 
                  timestamp: Date.now(), 
                  probYes: calculateProbability(marketData.yesPool, marketData.noPool) 
                }]
              } : m
            ));
          }
          
          setTimeout(() => refreshBalance(), 3000);
        } else {
          addToTicker(`[ERROR] Trade failed: ${result.error}`);
          alert(`Trade failed: ${result.error}`);
        }
      } else {
        setMarkets(prevMarkets => {
          return prevMarkets.map(m => {
            if (m.id !== marketId) return m;
          
            const newYes = direction === Outcome.YES ? m.yesPool + amount : m.yesPool;
            const newNo = direction === Outcome.NO ? m.noPool + amount : m.noPool;
            const currentProb = calculateProbability(newYes, newNo);
            
            return {
              ...m,
              yesPool: newYes,
              noPool: newNo,
              history: [...m.history, { timestamp: Date.now(), probYes: currentProb }]
            };
          });
        });
        
        addToTicker(`[USER] Bet ${amount} HSK on ${direction} for Market #${marketId}`);
      }
    } catch (error: any) {
      console.error('Trade failed:', error);
      addToTicker(`[ERROR] ${error.message}`);
    }
  };

  /**
   * 提取押金（已移除 - HashKey Chain 上种子资金直接进入市场池）
   */
  const handleWithdrawDeposit = async (marketId: number) => {
    alert('Deposit withdrawal is not available. Seed funds are added directly to market liquidity on HashKey Chain.');
  };

  return {
    handleUserTrade,
    handleWithdrawDeposit
  };
};
