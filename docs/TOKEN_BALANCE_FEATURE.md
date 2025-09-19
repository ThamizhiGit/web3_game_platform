# Token Balance Update Feature

## Overview

This feature automatically updates token balances on the frontend after blockchain transactions are confirmed. It provides real-time balance updates without requiring manual page refreshes.

## Features

- ✅ Automatic balance updates after transaction confirmation
- ✅ Support for both native tokens (ETH, MATIC, etc.) and ERC20 tokens
- ✅ Real-time transaction status notifications
- ✅ Visual feedback with animations when balances update
- ✅ Works on both mainnet and testnet environments
- ✅ Manual refresh capability
- ✅ Pending transaction tracking

## Components

### 1. `useTokenBalance` Hook

Located: `hooks/useTokenBalance.ts`

Main hook for managing token balances with automatic updates.

```typescript
const { balance, formatted, symbol, isLoading, isRefreshing, refreshBalance } = useTokenBalance({
  tokenAddress, // Optional: ERC20 token address
  decimals: 18,
  symbol: 'ETH',
});
```

### 2. `TokenBalance` Component

Located: `components/web3/TokenBalance.tsx`

Displays token balance with automatic updates and animations.

```tsx
<TokenBalance
  tokenAddress="0x..." // Optional: for ERC20 tokens
  symbol="ETH"
  decimals={18}
  showRefreshButton={true}
  precision={4}
/>
```

### 3. `WalletBalance` Component

Located: `components/web3/WalletBalance.tsx`

Comprehensive wallet balance dashboard showing native and token balances.

```tsx
<WalletBalance
  showNativeBalance={true}
  showTokenBalances={true}
  tokenAddresses={[
    { address: '0x...', symbol: 'TOKEN', decimals: 18 }
  ]}
/>
```

### 4. `TransactionStatus` Component

Located: `components/web3/TransactionStatus.tsx`

Shows pending transaction notifications and confirms when transactions are completed.

### 5. `WalletDashboard` Component

Located: `components/dashboard/WalletDashboard.tsx`

Complete dashboard component that combines all wallet-related features.

## How It Works

### 1. Transaction Monitoring

- Watches for pending transactions using `useWatchPendingTransactions`
- Monitors blockchain blocks for user transactions
- Automatically triggers balance refresh when transactions are detected

### 2. Balance Updates

- Uses wagmi's `useBalance` hook with manual refresh control
- Updates global state using Recoil atoms
- Provides visual feedback when balances change

### 3. Transaction Confirmation

- Tracks transaction hashes in pending state
- Uses `waitForTransactionReceipt` to wait for confirmations
- Emits events when transactions are confirmed
- Shows success notifications

## Usage Examples

### Basic Balance Display

```tsx
import TokenBalance from '@/components/web3/TokenBalance';

function MyComponent() {
  return (
    <div>
      <h3>Your Balance:</h3>
      <TokenBalance showRefreshButton={true} />
    </div>
  );
}
```

### Token Transfer with Balance Update

```tsx
import { usePendingTransaction } from '@/components/web3/TransactionStatus';
import { useWalletClient } from 'wagmi';

function TransferComponent() {
  const { data: walletClient } = useWalletClient();
  const { addPendingTransaction } = usePendingTransaction();

  const handleTransfer = async () => {
    const hash = await walletClient.sendTransaction({
      to: '0x...',
      value: parseEther('0.1'),
    });

    // Add to pending transactions for automatic tracking
    addPendingTransaction(hash);
  };

  return (
    <button onClick={handleTransfer}>
      Send Transaction
    </button>
  );
}
```

### Custom Token Balance

```tsx
<TokenBalance
  tokenAddress="0x1234567890123456789012345678901234567890"
  symbol="CUSTOM"
  decimals={18}
  precision={2}
  showSymbol={true}
  showRefreshButton={true}
/>
```

## Integration Points

### Dashboard Integration

The feature is integrated into the main dashboard at `/dashboard` and shows for all connected users.

### Global Transaction Status

Transaction status notifications appear globally across the application via the Layout component.

### State Management

Uses Recoil for global state management:

- `tokenBalanceAtom`: Stores token balance data
- `pendingTransactionsAtom`: Tracks pending transactions

## Testing

### Manual Testing

1. Connect your wallet to the application
2. Navigate to the dashboard
3. Use the "Test Token Transfer" component to send a small amount
4. Observe:
   - Pending transaction notification appears
   - Balance updates automatically after confirmation
   - Success notification shows when complete

### Automated Testing

The feature includes comprehensive error handling and fallbacks:

- Network disconnection handling
- Transaction failure recovery
- Invalid address validation
- Insufficient balance checks

## Configuration

### Adding Custom Tokens

To add custom token support, update the `tokenAddresses` array in `WalletDashboard.tsx`:

```typescript
const tokenAddresses = [
  {
    address: '0x...' as `0x${string}`,
    symbol: 'P12',
    decimals: 18,
  },
  // Add more tokens here
];
```

### Network Support

The feature automatically works with any network supported by wagmi. Network-specific configurations can be added in `constants/addresses.ts`.

## Performance Considerations

- Balance updates are debounced to prevent excessive API calls
- Transaction watching is optimized to only monitor relevant transactions
- Components use React.memo and useMemo for optimal re-rendering

## Browser Compatibility

- Modern browsers with Web3 support
- Mobile wallet browsers
- Desktop wallet extensions (MetaMask, etc.)

## Security

- All transactions require user approval
- No private keys are stored or transmitted
- Uses established wagmi/viem libraries for blockchain interactions
- Validates all addresses and amounts before transactions
