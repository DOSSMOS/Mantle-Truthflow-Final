import { Market, Outcome } from '../types';
import { getYesPrice, getEstimatedShares } from './MarketLogic';

/**
 * Mocks the interaction with the TruthArena.sol smart contract.
 * In production, this would use `viem` or `wagmi` to write to Mantle Mainnet.
 */

// CPMM Price Calculation: P(Yes) = NoPool / (YesPool + NoPool)
export const calculateProbability = (yesPool: number, noPool: number): number => {
  return getYesPrice(yesPool, noPool);
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Representing MNT stable value
    maximumFractionDigits: 0,
  }).format(val);
};

export const simulateTxDelay = async (ms: number = 800) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const calculatePotentialReturn = (
  market: Market,
  amount: number,
  direction: Outcome
): number => {
  const isBuyingYes = direction === Outcome.YES;
  const shares = getEstimatedShares(amount, isBuyingYes, market.yesPool, market.noPool);
  
  // If we win, each share is worth 1 MNT.
  return shares; 
};
