  'use client';

  import { useState, useEffect, useCallback } from 'react';
  import { ethers } from 'ethers';
  import { useWalletStore } from '@/store/useWalletStore';
  import { FAMILY_WALLET_ABI, FAMILY_WALLET_ADDRESS } from
  '@/lib/contracts/FamilyWallet';

  export function useFamilyWallet() {
    const { address, isConnected } = useWalletStore();
    const [contractBalance, setContractBalance] = useState<string>('0');
    const [isMember, setIsMember] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Get contract instance (read-only or read-write)
    const getContract = async (needsSigner: boolean = false) => {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);

      if (needsSigner) {
        // For transactions: need signer (can modify blockchain)
        const signer = await provider.getSigner();
        return new ethers.Contract(FAMILY_WALLET_ADDRESS, FAMILY_WALLET_ABI, signer);
      } else {
        // For reading: just provider (read-only)
        return new ethers.Contract(FAMILY_WALLET_ADDRESS, FAMILY_WALLET_ABI, provider);
      }
    };

    // Fetch user's balance in contract
    const fetchContractBalance = useCallback(async () => {
        if (!address || !isConnected) return;

        try {
        const contract = await getContract(false);
        const balance = await contract.getBalance(address);
        setContractBalance(ethers.formatEther(balance));
        } catch (error) {
        console.error('Failed to fetch contract balance:', error);
        }
    }, [address, isConnected]); // Dependencies: only re-create if these change

    // Check if user is a member
    const fetchMemberStatus = useCallback(async () => {
        if (!address || !isConnected) return;

        try {
        const contract = await getContract(false);
        const memberStatus = await contract.isMember(address);
        setIsMember(memberStatus);
        } catch (error) {
        console.error('Failed to fetch member status:', error);
        }
    }, [address, isConnected]);

    // Deposit ETH into contract (TRANSACTION)
    const deposit = async (amount: string): Promise<boolean> => {
      if (!address || !isConnected) {
        alert('Please connect your wallet');
        return false;
      }

      if (!isMember) {
        alert('You must be a family member to deposit');
        return false;
      }

      setIsLoading(true);

      try {
        const contract = await getContract(true); // true = needs signer (transaction)

        // Call deposit function with ETH value
        const tx = await contract.deposit({
          value: ethers.parseEther(amount), // Convert ETH to wei
        });

        console.log('Transaction sent:', tx.hash);

        // Wait for transaction to be mined (included in a block)
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt.hash);

        // Refresh balance after successful deposit
        await fetchContractBalance();

        alert('Deposit successful! 🎉');
        return true;
      } catch (error: unknown) {
        console.error('Deposit failed:', error);

        // Handle specific error cases
  if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as { code: string | number }).code;
      if (errorCode === 'ACTION_REJECTED' || errorCode === 4001) {
            alert('Transaction rejected by user');
            } else {
                if (error && typeof error === 'object' && 'message' in error) {
                alert('Deposit failed: ' + (error as { message: string }).message);
                } else {
                alert('Deposit failed');
                }                
            }
        }
        return false;
      } finally {
        setIsLoading(false); // Always reset loading state
      }
    };

    // Withdraw ETH from contract (TRANSACTION)
    const withdraw = async (amount: string): Promise<boolean> => {
      if (!address || !isConnected) {
        alert('Please connect your wallet');
        return false;
      }

      if (!isMember) {
        alert('You must be a family member to withdraw');
        return false;
      }

      setIsLoading(true);

      try {
        const contract = await getContract(true); // true = needs signer (transaction)

        // Call withdraw function with amount in wei
        const tx = await contract.withdraw(ethers.parseEther(amount));

        console.log('Transaction sent:', tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt.hash);

        // Refresh balance after successful withdrawal
        await fetchContractBalance();

        alert('Withdrawal successful! 💰');
        return true;
      } catch (error: unknown) {
        console.error('Withdraw failed:', error);

        if (error && typeof error === 'object' && 'code' in error) {
            const errorCode = (error as { code: string | number }).code;
            if (errorCode === 'ACTION_REJECTED' || errorCode === 4001) {
            alert('Transaction rejected by user');
            } else { 
                if (error && typeof error === 'object' && 'message' in error) {
                    const errorMessage = (error as { message: string }).message;
                if (errorMessage.includes('InsufficientBalance')) {
                    alert('Insufficient balance in contract');
                } else {
                    alert('Withdrawal failed: ' + errorMessage);
                }
            } else {
                alert('Withdrawal failed');
            }
            }
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    };

    // Auto-fetch data when wallet connects
    useEffect(() => {
      if (isConnected && address) {
        fetchContractBalance();
        fetchMemberStatus();
      }
    }, [isConnected, address, fetchContractBalance, fetchMemberStatus]);

    // Return everything components need
    return {
      contractBalance,
      isMember,
      isLoading,
      deposit,
      withdraw,
      refetch: () => {
        fetchContractBalance();
        fetchMemberStatus();
      },
    };
  }