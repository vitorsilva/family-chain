  'use client';

  import { useState } from 'react';
  import { useFamilyWallet } from '@/hooks/useFamilyWallet';
  import { useWalletStore } from '@/store/useWalletStore';

  export default function FamilyWalletActions() {
    const { isConnected } = useWalletStore();
    const { contractBalance, isMember, isLoading, deposit, withdraw } =
  useFamilyWallet();
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');

    const handleDeposit = async () => {
      if (!depositAmount || parseFloat(depositAmount) <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      const success = await deposit(depositAmount);
      if (success) {
        setDepositAmount('');
      }
    };

    const handleWithdraw = async () => {
      if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      const success = await withdraw(withdrawAmount);
      if (success) {
        setWithdrawAmount('');
      }
    };

    if (!isConnected) {
      return (
        <div className="p-6 bg-gray-100 rounded-lg text-center text-gray-500">
          Connect your wallet to interact with FamilyWallet
        </div>
      );
    }

    if (!isMember) {
      return (
        <div className="p-6 bg-yellow-100 rounded-lg border-l-4 border-yellow-500">     
          <p className="font-semibold text-yellow-800">⚠️ Not a Family Member</p>       
          <p className="text-sm text-yellow-700 mt-1">
            You must be added as a family member by the contract owner to deposit or    
   withdraw.
          </p>
        </div>
      );
    }

    return (
      <div className="p-6 bg-white rounded-lg shadow-lg space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">FamilyWallet Actions</h2>      

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Your Balance in Contract:</p>
          <p className="text-3xl font-bold text-blue-600">
            {parseFloat(contractBalance).toFixed(4)} ETH
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Deposit ETH
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.001"
              min="0"
              placeholder="0.001"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg
  focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"       
            />
            <button
              onClick={handleDeposit}
              disabled={isLoading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg
  hover:bg-green-600 transition-colors font-semibold disabled:opacity-50
  disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Deposit'}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Enter amount in ETH (e.g., 0.001 = 0.001 ETH)
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Withdraw ETH
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.001"
              min="0"
              placeholder="0.001"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg
  focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"       
            />
            <button
              onClick={handleWithdraw}
              disabled={isLoading}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600    
   transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"     
            >
              {isLoading ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Maximum: {parseFloat(contractBalance).toFixed(4)} ETH
          </p>
        </div>

        {isLoading && (
          <div className="p-4 bg-blue-100 rounded-lg border-l-4 border-blue-500">       
            <p className="font-semibold text-blue-800">⏳ Transaction Pending</p>       
            <p className="text-sm text-blue-700 mt-1">
              Please confirm in MetaMask and wait for blockchain confirmation
  (~15-30 seconds).
            </p>
          </div>
        )}
      </div>
    );
  }