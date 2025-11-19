'use client';

import ConnectWalletButton from '@/components/ConnectWalletButton';
import WalletInfo from '@/components/WalletInfo';
import MetaMaskListener from '@/components/MetaMaskListener';

export default function Home() {
  return (
    <>
      <MetaMaskListener />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-gray-900">
              FamilyChain DApp
            </h1>
            <p className="text-lg text-gray-600">
              Decentralized Family Finance Platform
            </p>
          </div>

          {/* Connect Wallet Section */}
          <div className="flex justify-center">
            <ConnectWalletButton />
          </div>

          {/* Wallet Info Section */}
          <WalletInfo />

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>Built with Next.js 15, ethers.js v6, and Zustand</p>
            <p className="mt-1">FamilyWallet Contract: Sepolia Testnet</p>
          </div>
        </div>
      </main>
    </>
  );
}