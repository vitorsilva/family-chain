  'use client';

  import { useEffect } from 'react';
  import { useWalletStore } from '@/store/useWalletStore';

  export default function MetaMaskListener() {
    const { address, connect, disconnect } = useWalletStore();

    useEffect(() => {
      if (typeof window.ethereum === 'undefined') return;

      // Handle account changes
      const handleAccountsChanged = (accounts: unknown) => {
        const accountsArray = accounts as string[];
        if (accountsArray.length === 0) {
          // User disconnected all accounts
          disconnect();
        } else if (accountsArray[0] !== address) {
          // User switched account
          connect();
        }
      };

      // Handle network changes
      const handleChainChanged = () => {
        // Reload the page on network change (recommended by MetaMask)
        window.location.reload();
      };

      // Subscribe to events
      window.ethereum!.on('accountsChanged', handleAccountsChanged);
      window.ethereum!.on('chainChanged', handleChainChanged);

      // Cleanup
      return () => {
        if (typeof window.ethereum === 'undefined') return;
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);       
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }, [address, connect, disconnect]);

    return null;
  }