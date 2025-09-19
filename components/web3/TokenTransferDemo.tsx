import React, { useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { usePendingTransaction } from './TransactionStatus';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface TokenTransferDemoProps {
  className?: string;
}

export default function TokenTransferDemo({ className }: TokenTransferDemoProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { addPendingTransaction } = usePendingTransaction();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTransfer = async () => {
    if (!walletClient || !publicClient || !address) {
      setError('Wallet not connected');
      return;
    }

    if (!recipient || !amount) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Validate recipient address
      if (!recipient.startsWith('0x') || recipient.length !== 42) {
        throw new Error('Invalid recipient address');
      }

      // Parse amount
      const value = parseEther(amount);

      // Send transaction
      const hash = await walletClient.sendTransaction({
        to: recipient as `0x${string}`,
        value,
      });

      // Add to pending transactions for tracking
      addPendingTransaction(hash);

      // Clear form
      setRecipient('');
      setAmount('');
      
      console.log('Transaction sent:', hash);
    } catch (err: any) {
      console.error('Transfer error:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className={twMerge('rounded-lg border border-gray-200 p-4 dark:border-gray-700', className)}>
        <p className="text-center text-sm text-gray-500">Connect wallet to test transfers</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={twMerge(
        'rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Test Token Transfer
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount (ETH)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.001"
            step="0.001"
            min="0"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={handleTransfer}
          disabled={isLoading || !recipient || !amount}
          className={twMerge(
            'w-full rounded-md px-4 py-2 text-sm font-medium text-white transition-colors',
            'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isLoading && 'cursor-wait'
          )}
        >
          {isLoading ? 'Sending...' : 'Send Transaction'}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        This will send a native token transfer. Your balance will update automatically after confirmation.
      </div>
    </motion.div>
  );
}