import React, { useState, useEffect, useCallback } from 'react';
import { RedBlueChallenge } from './RedBlueChallenge';
import { challengeService, OnChainChallenge } from '../services/challengeService';

interface TabContentProps {
  tab: 'DEFEND' | 'ATTACK';
  marketId: number;
}

export const TabContent: React.FC<TabContentProps> = ({ tab, marketId }) => {
  const [challenges, setChallenges] = useState<OnChainChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadChallenges = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await challengeService.getMarketChallenges(marketId);
      setChallenges(data);
    } catch (e) {
      console.error('Failed to load challenges:', e);
    } finally {
      setIsLoading(false);
    }
  }, [marketId]);

  // Load on mount + poll every 10s
  useEffect(() => {
    loadChallenges();
    const interval = setInterval(loadChallenges, 10000);
    return () => clearInterval(interval);
  }, [loadChallenges]);

  const handleAddChallenge = async (challenge: any) => {
    const isRed = challenge.type === 'red';
    const result = await challengeService.submitChallenge(
      marketId,
      isRed,
      challenge.title,
      challenge.evidence,
      challenge.replyToId ? Number(challenge.replyToId) : 0
    );
    if (result.success) {
      // Reload from chain after successful submission
      await loadChallenges();
    } else {
      alert('提交失败: ' + result.error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto max-h-[300px] mb-4 scrollbar-thin">
      {isLoading && challenges.length === 0 && (
        <div className="text-center text-gray-600 text-xs py-2 font-mono">Loading from chain...</div>
      )}
      <RedBlueChallenge 
        marketId={marketId} 
        side={tab === 'DEFEND' ? 'blue' : 'red'} 
        challenges={challenges}
        onAddChallenge={handleAddChallenge}
      />
    </div>
  );
};
