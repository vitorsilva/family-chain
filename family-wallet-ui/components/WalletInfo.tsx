'use client';

import { useWalletStore } from '@/store/useWalletStore';
import { useEffect } from 'react';

export default function WalletInfo() {
    const { address, balance, chainId, isConnected, updateBalance } = useWalletStore();

    // Update balance every 10 seconds
    useEffect(() => {
        if (!isConnected) return;

        updateBalance(); // Initial load
        const interval = setInterval(updateBalance, 10000);
        return () => clearInterval(interval);
    }, [isConnected, updateBalance]);

    // Network name lookup
    const getNetworkName = (chainId: string | null): string => {
        if (!chainId) return 'Unknown';
        const id = parseInt(chainId, 16);
        switch (id) {
        case 1:
            return 'Ethereum Mainnet';
        case 11155111:
            return 'Sepolia Testnet';
        case 137:
            return 'Polygon';
        default:
            return `Chain ID: ${id}`;
        }
    };

    if (!isConnected || !address) {
        return (
        <div className="p-6 bg-gray-100 rounded-lg text-center text-gray-500">
            Connect your wallet to see details
        </div>
        );
    }

    const isCorrectNetwork = chainId === '0xaa36a7'; // Sepolia

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Wallet Information</h2>        

        <div className="space-y-2">
            <div className="flex justify-between items-center">
            <span className="text-gray-600">Address:</span>
            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                {address}
            </span>
            </div>

            <div className="flex justify-between items-center">
            <span className="text-gray-600">Balance:</span>
            <span className="font-bold text-xl text-blue-600">
                {parseFloat(balance).toFixed(4)} ETH
            </span>
            </div>

            <div className="flex justify-between items-center">
            <span className="text-gray-600">Network:</span>
            <span
                className={`px-3 py-1 rounded font-semibold ${
                isCorrectNetwork
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
            >
                {getNetworkName(chainId)}
            </span>
            </div>

            {!isCorrectNetwork && (
            <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800">
                <p className="font-semibold">⚠️ Wrong Network</p>
                <p className="text-sm mt-1">
                Please switch to Sepolia Testnet in MetaMask to use this DApp.
                </p>
            </div>
            )}
        </div>
        </div>
    );
}