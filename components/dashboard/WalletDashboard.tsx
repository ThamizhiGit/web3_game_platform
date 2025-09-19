import React from 'react';
import { useAccount, useNetwork } from 'wagmi';
import WalletBalance from '@/components/web3/WalletBalance';
import TransactionStatus from '@/components/web3/TransactionStatus';
import TokenTransferDemo from '@/components/web3/TokenTransferDemo';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface WalletDashboardProps {
  className?: string;
  showTransactionStatus?: boolean;
}

export default function WalletDashboard({ 
  className, 
  showTransactionStatus = true 
}: WalletDashboardProps) {
  const { isConnected } = useAccount();
  const { chain } = useNetwork();

  // Example token addresses - you can customize these based on your needs
  const tokenAddresses = [
    // Add your project's token addresses here
    // {
    //   address: '0x...' as `0x${string}`,
    //   symbol: 'P12',
    //   decimals: 18,
    // },
  ];

  const handleTransactionConfirmed = (txHash: string) => {
    console.log('Transaction confirmed in dashboard:', txHash);
    // You can add additional logic here, like showing notifications
  };

  if (!isConnected) {
    return (
      <div className={twMerge('backdrop-box mt-7.5 rounded-2xl p-7.5', className)}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Wallet Dashboard
          </h3>
          <p className="text-gray-500">Connect your wallet to view balances and transactions</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={twMerge('backdrop-box mt-7.5 rounded-2xl p-7.5', className)}
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Wallet Dashboard
          </h3>
          <p className="text-sm text-gray-500">
            Your balances update automatically after transactions
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Native Token Balance */}
          <WalletBalance
            showNativeBalance={true}
            showTokenBalances={false}
          />

          {/* Token Balances (if any) */}
          {tokenAddresses.length > 0 && (
            <WalletBalance
              showNativeBalance={false}
              showTokenBalances={true}
              tokenAddresses={tokenAddresses}
            />
          )}
        </div>

        {/* Demo Transfer Component for Testing */}
        <div className="mt-6">
          <TokenTransferDemo />
        </div>

        {/* Network Info */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Network
            </span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-900 dark:text-white">
                {chain?.name || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Transaction Status Notifications */}
      {showTransactionStatus && (
        <TransactionStatus onTransactionConfirmed={handleTransactionConfirmed} />
      )}
    </>
  );
}