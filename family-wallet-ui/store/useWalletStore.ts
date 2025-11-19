import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';

// Define wallet state interface
interface WalletState {
    address: string | null;
    balance: string;
    isConnected: boolean;
    isConnecting: boolean;
    chainId: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    //updateBalance: () => Promise<void>;
}

  // Create Zustand store with persistence
  export const useWalletStore = create<WalletState>()(
    persist(
      (set, get) => ({
        // Initial state
        address: null,
        balance: '0',
        isConnected: false,
        isConnecting: false,
        chainId: null,

        // Disconnect wallet action
        disconnect: () => {
          set({
            address: null,
            balance: '0',
            isConnected: false,
            chainId: null,
          });
          console.log('Wallet disconnected');
        },

        // Connect wallet action
        connect: async () => {
          set({ isConnecting: true });

          try {
            // Check if MetaMask is installed
            if (typeof window.ethereum === 'undefined') {
              alert('MetaMask is not installed. Please install it to use this DApp.');
              set({ isConnecting: false });
              return;
            }
            
            // Create provider (ethers v6 syntax)
            const provider = new ethers.BrowserProvider(window.ethereum!);

            // Request accounts (triggers MetaMask popup)
            const accounts = await provider.send('eth_requestAccounts', []);
            const address = accounts[0];

            // Get network chain ID
            const network = await provider.getNetwork();
            const chainId = '0x' + network.chainId.toString(16);

            // Get balance
            const balanceWei = await provider.getBalance(address);
            const balance = ethers.formatEther(balanceWei);

            // Update state
            set({
              address,
              balance,
              isConnected: true,
              isConnecting: false,
              chainId,
            });

            console.log('Wallet connected:', address);
            console.log('Balance:', balance, 'ETH');
            console.log('Chain ID:', chainId);

          } catch (error: unknown) {
                console.error('Connection error:', error);
                set({ isConnecting: false });

                // Check if error is an object with a code property
                if (error && typeof error === 'object' && 'code' in error) {
                const errorCode = (error as { code: number }).code;
                if (errorCode === 4001) {
                    alert('Connection rejected by user');
                    return;
                }
                }

                // Check if error has a message property
                if (error && typeof error === 'object' && 'message' in error) {
                alert('Failed to connect wallet: ' + (error as { message: string }).message);
                } else {
                alert('Failed to connect wallet');
                }
          }
        },

        // Other actions will go here next

      }),
      {
        name: 'wallet-storage',
      }
    )
  );