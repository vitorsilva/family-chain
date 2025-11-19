  'use client';

  import { useEffect, useRef } from 'react';
  import { useWalletStore } from '@/store/useWalletStore';

  export default function MetaMaskListener() {
    const address = useWalletStore((state) => state.address);
    const connectRef = useRef(useWalletStore.getState().connect);
    const disconnectRef = useRef(useWalletStore.getState().disconnect);

    useEffect(() => {
      console.log('🎯 Setting up MetaMask listeners');

      if (!window.ethereum) {
        console.log('❌ No MetaMask');
        return;
      }

      const handleChainChanged = (chainId: unknown) => {
        console.log('🔔 CHAIN CHANGED EVENT FIRED! New chain:', chainId);
        window.location.reload();
      };

      const handleAccountsChanged = (accounts: unknown) => {
        console.log('🔔 ACCOUNTS CHANGED EVENT FIRED!', accounts);
        const accs = accounts as string[];

        if (accs.length === 0) {
          disconnectRef.current();
        } else if (accs[0] !== address) {
          connectRef.current();
        }
      };

      console.log('📡 Attaching event listeners...');
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      console.log('✅ Event listeners attached successfully!');

      return () => {
        console.log('🧹 Removing event listeners');
        if (window.ethereum) {
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);     
        }
      };
    }, []); // Empty dependencies - only run once on mount!

    return null;
  }