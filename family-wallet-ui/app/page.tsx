'use client';

import ConnectWalletButton from '@/components/ConnectWalletButton';
import FamilyWalletActions from '@/components/FamilyWalletActions';
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

          {/* Contract Interaction Section */}
          <FamilyWalletActions />

  {/* Footer */}
  <div className="text-center text-sm text-gray-500">
    <p>Built with Next.js 16, ethers.js v6, and Zustand</p>
    <p className="mt-1">
      FamilyWallet:{' '}
      <a
        href="https://sepolia.etherscan.io/address/0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:text-blue-700 underline font-mono"
      >
        0xaa8f...716e
      </a>
    </p>
  </div>
        </div>
      </main>
    </>
  );
}