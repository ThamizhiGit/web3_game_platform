import React, { useEffect, useState } from 'react';
import { Address } from 'wagmi';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

interface TokenBalanceProps {
  tokenAddress?: Address;
  symbol?: string;
  decimals?: number;
  className?: string;
  showSymbol?: boolean;
  showRefreshButton?: boolean;
  precision?: number;
}

export default function TokenBalance({
  tokenAddress,
  symbol = 'ETH',
  decimals = 18,
  className,
  showSymbol = true,
  showRefreshButton = false,
  precision = 4,
}: TokenBalanceProps) {
  const { 
    balance, 
    formatted, 
    symbol: actualSymbol, 
    isLoading, 
    isRefreshing, 
    refreshBalance 
  } = useTokenBalance({ tokenAddress, decimals, symbol });

  const [previousBalance, setPreviousBalance] = useState<string>('');
  const [showUpdateAnimation, setShowUpdateAnimation] = useState(false);

  // Track balance changes for animation
  useEffect(() => {
    if (formatted && formatted !== previousBalance && previousBalance !== '') {
      setShowUpdateAnimation(true);
      const timer = setTimeout(() => setShowUpdateAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
    if (formatted) {
      setPreviousBalance(formatted);
    }
  }, [formatted, previousBalance]);

  // Format balance with specified precision
  const formatBalance = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    return num.toFixed(precision);
  };

  if (isLoading) {
    return (
      <div className={twMerge('flex items-center gap-2', className)}>
        <div className="h-4 w-16 animate-pulse rounded bg-gray-300" />
        {showSymbol && <span className="text-sm text-gray-500">{symbol}</span>}
      </div>
    );
  }

  return (
    <div className={twMerge('flex items-center gap-2', className)}>
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.span
            key={formatted}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className={twMerge(
              'font-mono text-sm font-semibold',
              showUpdateAnimation && 'text-green-500'
            )}
          >
            {formatBalance(formatted)}
          </motion.span>
        </AnimatePresence>
        
        {showUpdateAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-6 left-0 rounded bg-green-500 px-2 py-1 text-xs text-white"
          >
            Updated!
          </motion.div>
        )}
      </div>
      
      {showSymbol && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {actualSymbol}
        </span>
      )}
      
      {showRefreshButton && (
        <button
          onClick={refreshBalance}
          disabled={isRefreshing}
          className={twMerge(
            'rounded p-1 text-xs transition-colors hover:bg-gray-100 dark:hover:bg-gray-800',
            isRefreshing && 'animate-spin cursor-not-allowed'
          )}
          title="Refresh balance"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Component for displaying multiple token balances
export function TokenBalanceList({ 
  tokens, 
  className 
}: { 
  tokens: Array<{ address?: Address; symbol: string; decimals?: number }>;
  className?: string;
}) {
  return (
    <div className={twMerge('space-y-2', className)}>
      {tokens.map((token, index) => (
        <div key={token.address || token.symbol} className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {token.symbol}
          </span>
          <TokenBalance
            tokenAddress={token.address}
            symbol={token.symbol}
            decimals={token.decimals}
            showSymbol={false}
          />
        </div>
      ))}
    </div>
  );
}