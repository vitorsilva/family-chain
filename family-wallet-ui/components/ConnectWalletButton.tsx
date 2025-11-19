'use client';

import { useWalletStore } from '@/store/useWalletStore';

export default function ConnectWalletButton() {
const { address, isConnected, isConnecting, connect, disconnect } = useWalletStore();

// Format address: 0x1234...5678
const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

return (
    <div className="flex items-center gap-4">
    {isConnected && address ? (
        <>
        <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-mono text-sm">
            {formatAddress(address)}
        </div>
        <button
            onClick={disconnect}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
        >
            Disconnect
        </button>
        </>
    ) : (
        <button
        onClick={connect}
        disabled={isConnecting}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"     
        >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
    )}
    </div>
);
}