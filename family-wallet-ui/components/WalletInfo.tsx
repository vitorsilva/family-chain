
  'use client';

  import { useWalletStore } from '@/store/useWalletStore';
  import { useEffect, useState } from 'react';

  export default function WalletInfo() {
    const { address, balance, chainId, isConnected, updateBalance } =
  useWalletStore();
    const [isSwitching, setIsSwitching] = useState(false);

    useEffect(() => {
      if (!isConnected) return;

      updateBalance(); // Initial load
      const interval = setInterval(updateBalance, 10000);
      return () => clearInterval(interval); // Cleanup function
    }, [isConnected, updateBalance]);

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

    const switchToSepolia = async () => {
      if (!window.ethereum) return;

      setIsSwitching(true);

      try {
        // Try to switch to Sepolia (chain ID: 0xaa36a7)
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }],
        });

        console.log('✅ Successfully switched to Sepolia');

        // Reload page to update all state
        window.location.reload();
      } catch (error: unknown) {
        // Handle errors
        if (error && typeof error === 'object' && 'code' in error) {
          const errorCode = (error as { code: number }).code;

          // Error code 4902: Chain not added to MetaMask yet
          if (errorCode === 4902) {
            console.log('Sepolia not in MetaMask, adding it...');

            try {
              // Add Sepolia network to MetaMask
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia Testnet',
                    nativeCurrency: {
                      name: 'SepoliaETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://sepolia.infura.io/v3/'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                  },
                ],
              });

              console.log('✅ Sepolia network added and switched');
              window.location.reload();
            } catch (addError: unknown) {
              console.error('Failed to add Sepolia network:', addError);

              if (addError && typeof addError === 'object' && 'code' in addError) {     
                const addErrorCode = (addError as { code: number }).code;
                if (addErrorCode === 4001) {
                  alert('Network addition rejected by user');
                }
              } else {
                alert('Failed to add Sepolia network');
              }

              setIsSwitching(false);
            }
          } else if (errorCode === 4001) {
            // User rejected the switch
            console.log('User rejected network switch');
            alert('Network switch rejected by user');
            setIsSwitching(false);
          } else {
            console.error('Failed to switch network:', error);
            alert('Failed to switch network');
            setIsSwitching(false);
          }
        } else {
          console.error('Unknown error:', error);
          alert('Failed to switch network');
          setIsSwitching(false);
        }
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
            <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500
  text-yellow-800 space-y-3">
              <div>
                <p className="font-semibold">⚠️ Wrong Network</p>
                <p className="text-sm mt-1">
                  Please switch to Sepolia Testnet to use this DApp.
                </p>
              </div>

              <button
                onClick={switchToSepolia}
                disabled={isSwitching}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg
  hover:bg-yellow-700 transition-colors font-semibold disabled:opacity-50
  disabled:cursor-not-allowed"
              >
                {isSwitching ? 'Switching...' : 'Switch to Sepolia'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }