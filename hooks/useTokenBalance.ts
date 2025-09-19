import { useEffect, useState, useCallback } from 'react';
import { Address, useAccount, useBalance, usePublicClient, useWatchPendingTransactions } from 'wagmi';
import { formatUnits } from 'viem';
import { useRecoilState } from 'recoil';
import { tokenBalanceAtom } from '@/store/web3/state';

interface UseTokenBalanceProps {
    tokenAddress?: Address;
    decimals?: number;
    symbol?: string;
    enabled?: boolean;
}

export function useTokenBalance({
    tokenAddress,
    decimals = 18,
    symbol = 'ETH',
    enabled = true
}: UseTokenBalanceProps = {}) {
    const { address: userAddress, isConnected } = useAccount();
    const publicClient = usePublicClient();
    const [tokenBalance, setTokenBalance] = useRecoilState(tokenBalanceAtom);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Get native token balance (ETH, MATIC, etc.)
    const { data: nativeBalance, refetch: refetchNative } = useBalance({
        address: userAddress,
        enabled: enabled && isConnected && !tokenAddress,
        watch: false, // We'll handle watching manually for better control
    });

    // Get ERC20 token balance
    const { data: tokenBalanceData, refetch: refetchToken } = useBalance({
        address: userAddress,
        token: tokenAddress,
        enabled: enabled && isConnected && !!tokenAddress,
        watch: false,
    });

    // Watch for pending transactions to trigger balance updates
    useWatchPendingTransactions({
        onTransactions(transactions) {
            // Filter transactions that might affect the user's balance
            const relevantTxs = transactions.filter(tx =>
                tx.from === userAddress || tx.to === userAddress
            );

            if (relevantTxs.length > 0) {
                // Delay the balance refresh to allow for transaction confirmation
                setTimeout(() => {
                    refreshBalance();
                }, 2000);
            }
        },
        enabled: isConnected && enabled,
    });

    // Manual balance refresh function
    const refreshBalance = useCallback(async () => {
        if (!isConnected || !userAddress) return;

        setIsRefreshing(true);
        try {
            if (tokenAddress) {
                await refetchToken();
            } else {
                await refetchNative();
            }
        } catch (error) {
            console.error('Error refreshing balance:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [isConnected, userAddress, tokenAddress, refetchToken, refetchNative]);

    // Update global state when balance changes
    useEffect(() => {
        const currentBalance = tokenAddress ? tokenBalanceData : nativeBalance;
        if (currentBalance) {
            const balanceKey = tokenAddress || 'native';
            setTokenBalance(prev => ({
                ...prev,
                [balanceKey]: {
                    value: currentBalance.value,
                    formatted: currentBalance.formatted,
                    symbol: currentBalance.symbol,
                    decimals: currentBalance.decimals,
                }
            }));
        }
    }, [nativeBalance, tokenBalanceData, tokenAddress, setTokenBalance]);

    // Listen for transaction confirmations using public client
    useEffect(() => {
        if (!publicClient || !isConnected || !userAddress) return;

        const unwatch = publicClient.watchBlocks({
            onBlock: async (block) => {
                // Check if any transactions in the block involve the user
                if (block.transactions) {
                    const userTxs = block.transactions.filter(tx =>
                        typeof tx === 'object' && (tx.from === userAddress || tx.to === userAddress)
                    );

                    if (userTxs.length > 0) {
                        // Wait a bit for the transaction to be fully processed
                        setTimeout(() => {
                            refreshBalance();
                        }, 1000);
                    }
                }
            },
        });

        return () => unwatch();
    }, [publicClient, isConnected, userAddress, refreshBalance]);

    const currentBalance = tokenAddress ? tokenBalanceData : nativeBalance;

    return {
        balance: currentBalance,
        formatted: currentBalance?.formatted || '0',
        symbol: currentBalance?.symbol || symbol,
        value: currentBalance?.value || BigInt(0),
        decimals: currentBalance?.decimals || decimals,
        isLoading: !currentBalance && isConnected,
        isRefreshing,
        refreshBalance,
    };
}

// Hook for watching transaction confirmations and updating balances
export function useTransactionWatcher() {
    const { address: userAddress } = useAccount();
    const publicClient = usePublicClient();
    const [, setTokenBalance] = useRecoilState(tokenBalanceAtom);

    const watchTransaction = useCallback(async (txHash: `0x${string}`) => {
        if (!publicClient || !txHash) return;

        try {
            // Wait for transaction confirmation
            const receipt = await publicClient.waitForTransactionReceipt({
                hash: txHash,
                confirmations: 1,
            });

            if (receipt.status === 'success') {
                // Transaction confirmed, trigger balance refresh
                // This will be handled by the balance hooks automatically
                console.log('Transaction confirmed:', txHash);

                // Emit a custom event that balance hooks can listen to
                window.dispatchEvent(new CustomEvent('transactionConfirmed', {
                    detail: { txHash, receipt }
                }));
            }
        } catch (error) {
            console.error('Error watching transaction:', error);
        }
    }, [publicClient]);

    return { watchTransaction };
}