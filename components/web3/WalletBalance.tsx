import React from 'react';
import { useAccount, useNetwork } from 'wagmi';
import TokenBalance from './TokenBalance';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

interface WalletBalanceProps {
  className?: string;
  showNativeBalance?: boolean;
  showTokenBalances?: boolean;
  tokenAddresses?: Array<{
    address: `0x${string}`;
    symbol: string;
    decimals?: number;
  }>;
}

export default function WalletBalance({
  className,
  showNativeBalance = true,
  showTokenBalances = false,
  tokenAddresses = [],
}: WalletBalanceProps) {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  if (!isConnected || !address) {
    return (
      <div className={twMerge('rounded-lg border border-gray-200 p-4 dark:border-gray-700', className)}>
        <p className="text-center text-sm text-gray-500">Connect wallet to view balances</p>
      </div>
    );
  }

  const nativeSymbol = chain?.nativeCurrency?.symbol || 'ETH';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={twMerge(
        'rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Wallet Balance
        </h3>
        <div className="text-xs text-gray-500">
          {chain?.name || 'Unknown Network'}
        </div>
      </div>

      <div className="space-y-3">
        {showNativeBalance && (
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                {nativeSymbol}
              </span>
            </div>
            <TokenBalance
              showSymbol={false}
              showRefreshButton={true}
              precision={6}
              className="text-lg font-bold"
            />
          </div>
        )}

        {showTokenBalances && tokenAddresses.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Token Balances
            </h4>
            {tokenAddresses.map((token) => (
              <div
                key={token.address}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-r from-green-500 to-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {token.symbol}
                  </span>
                </div>
                <TokenBalance
                  tokenAddress={token.address}
                  symbol={token.symbol}
                  decimals={token.decimals}
                  showSymbol={false}
                  showRefreshButton={true}
                  precision={4}
                  className="font-semibold"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Balances update automatically after transactions
      </div>
    </motion.div>
  );
}