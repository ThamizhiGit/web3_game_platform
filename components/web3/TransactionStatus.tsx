import React, { useEffect, useState } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { useRecoilState } from 'recoil';
import { pendingTransactionsAtom } from '@/store/web3/state';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

interface TransactionStatusProps {
  className?: string;
  onTransactionConfirmed?: (txHash: string) => void;
}

export default function TransactionStatus({ 
  className, 
  onTransactionConfirmed 
}: TransactionStatusProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [pendingTxs, setPendingTxs] = useRecoilState(pendingTransactionsAtom);
  const [confirmedTxs, setConfirmedTxs] = useState<string[]>([]);

  // Watch pending transactions for confirmation
  useEffect(() => {
    if (!publicClient || pendingTxs.length === 0) return;

    const watchTransactions = async () => {
      for (const txHash of pendingTxs) {
        try {
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash as `0x${string}`,
            confirmations: 1,
          });

          if (receipt.status === 'success') {
            // Remove from pending and add to confirmed
            setPendingTxs(prev => prev.filter(tx => tx !== txHash));
            setConfirmedTxs(prev => [...prev, txHash]);
            
            // Notify parent component
            onTransactionConfirmed?.(txHash);
            
            // Emit global event for balance updates
            window.dispatchEvent(new CustomEvent('transactionConfirmed', {
              detail: { txHash, receipt }
            }));

            // Remove from confirmed after 5 seconds
            setTimeout(() => {
              setConfirmedTxs(prev => prev.filter(tx => tx !== txHash));
            }, 5000);
          }
        } catch (error) {
          console.error('Error watching transaction:', error);
          // Remove failed transaction from pending
          setPendingTxs(prev => prev.filter(tx => tx !== txHash));
        }
      }
    };

    watchTransactions();
  }, [publicClient, pendingTxs, setPendingTxs, onTransactionConfirmed]);

  // Function to add a new pending transaction
  const addPendingTransaction = (txHash: string) => {
    setPendingTxs(prev => [...prev, txHash]);
  };

  // Expose the function globally for other components to use
  useEffect(() => {
    (window as any).addPendingTransaction = addPendingTransaction;
    return () => {
      delete (window as any).addPendingTransaction;
    };
  }, []);

  if (pendingTxs.length === 0 && confirmedTxs.length === 0) {
    return null;
  }

  return (
    <div className={twMerge('fixed bottom-4 right-4 z-50 space-y-2', className)}>
      <AnimatePresence>
        {pendingTxs.map((txHash) => (
          <motion.div
            key={txHash}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="flex items-center gap-3 rounded-lg bg-yellow-100 p-3 shadow-lg dark:bg-yellow-900"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Transaction Pending
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-300">
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </p>
            </div>
          </motion.div>
        ))}

        {confirmedTxs.map((txHash) => (
          <motion.div
            key={txHash}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="flex items-center gap-3 rounded-lg bg-green-100 p-3 shadow-lg dark:bg-green-900"
          >
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-600">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Transaction Confirmed
              </p>
              <p className="text-xs text-green-600 dark:text-green-300">
                Balance updated
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook to easily add pending transactions from other components
export function usePendingTransaction() {
  const addTransaction = (txHash: string) => {
    if (typeof window !== 'undefined' && (window as any).addPendingTransaction) {
      (window as any).addPendingTransaction(txHash);
    }
  };

  return { addPendingTransaction: addTransaction };
}