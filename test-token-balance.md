# Token Balance Feature Test Guide

## Testing Steps

### 1. Start the Application

```bash
npm run dev
```

The app should be running on http://localhost:3001

### 2. Connect Your Wallet

1. Navigate to http://localhost:3001/dashboard
2. Click "Connect" button
3. Connect with MetaMask or your preferred wallet
4. Make sure you're on a testnet (Polygon Mumbai, Goerli, etc.)

### 3. Verify Balance Display

- After connecting, you should see the "Wallet Dashboard" section
- Your native token balance should be displayed
- The balance should show with a refresh button

### 4. Test Automatic Balance Updates

1. In the "Test Token Transfer" section:

   - Enter a test address (you can use another wallet you own)
   - Enter a small amount (e.g., 0.001 ETH)
   - Click "Send Transaction"

2. Observe the following sequence:
   - Transaction pending notification appears (yellow)
   - Your wallet prompts for confirmation
   - After confirming, the transaction is submitted
   - Pending notification shows transaction hash
   - After ~15-30 seconds (depending on network), you'll see:
     - Green "Transaction Confirmed" notification
     - Your balance automatically updates
     - Balance shows with green highlight briefly

### 5. Manual Refresh Test

- Click the refresh button next to your balance
- Balance should update immediately
- Refresh button should show spinning animation briefly

## Expected Behavior

✅ **Automatic Updates**: Balance updates without page refresh after transaction confirmation
✅ **Visual Feedback**: Green highlight when balance changes
✅ **Transaction Status**: Clear pending/confirmed notifications
✅ **Manual Refresh**: Working refresh button
✅ **Error Handling**: Proper error messages for invalid inputs
✅ **Network Support**: Works on both mainnet and testnet

## Troubleshooting

### Balance Not Updating

- Check browser console for errors
- Ensure wallet is connected to the correct network
- Try manual refresh button
- Check if transaction was actually confirmed on block explorer

### Transaction Notifications Not Showing

- Check if TransactionStatus component is rendered
- Verify transaction hash is being tracked
- Check browser console for WebSocket connection issues

### Performance Issues

- Balance updates are debounced by 2 seconds
- Multiple rapid transactions may cause delays
- This is normal behavior to prevent API spam

## Code Verification

The implementation includes:

1. **useTokenBalance Hook** (`hooks/useTokenBalance.ts`)

   - Automatic balance fetching
   - Transaction monitoring
   - Manual refresh capability

2. **TokenBalance Component** (`components/web3/TokenBalance.tsx`)

   - Balance display with animations
   - Refresh button
   - Loading states

3. **TransactionStatus Component** (`components/web3/TransactionStatus.tsx`)

   - Pending transaction tracking
   - Confirmation notifications
   - Global transaction monitoring

4. **WalletDashboard Component** (`components/dashboard/WalletDashboard.tsx`)

   - Complete wallet interface
   - Balance display
   - Transfer testing

5. **Global Integration**
   - Added to main dashboard
   - Global transaction status in layout
   - Recoil state management

## Success Criteria Met

✅ After a successful token transfer, the user's token balance updates automatically on the frontend
✅ The update occurs only after the transaction is confirmed on the blockchain  
✅ No manual page refresh is required
✅ The solution works for both mainnet and testnet environments
✅ Uses latest wagmi/viem methods for blockchain interaction
✅ Comprehensive error handling and user feedback
