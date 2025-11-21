  import { ethers } from "ethers";
  import { network } from "hardhat";

  export class BlockchainService {
    private provider!: ethers.Provider;
    private signer!: ethers.Signer;
    private address!: string;

    /**
     * Initialize the blockchain service
     * Connects to network and loads signer from keystore
     */
    async initialize(networkName: string = "sepolia"): Promise<void> {
      console.log(`🔗 Connecting to ${networkName}...`);

      const connection = await network.connect(networkName);
      this.provider = connection.ethers.provider;

      const signers = await connection.ethers.getSigners();
      this.signer = signers[0];
      this.address = await this.signer.getAddress();

      console.log(`✅ Connected! Address: ${this.address}`);
    }

    /**
     * Get the signer address
     */
    getAddress(): string {
      return this.address;
    }

    /**
     * Get wallet balance
     */
    async getBalance(address?: string): Promise<bigint> {
      const addr = address || this.address;
      return await this.provider.getBalance(addr);
    }

    /**
     * Get current nonce for address
     */
    async getNonce(address?: string): Promise<number> {
      const addr = address || this.address;
      return await this.provider.getTransactionCount(addr);
    }

    /**
     * Create a contract instance (read-only or with signer)
     */
    getContract(
      address: string,
      abi: any[],
      needsSigner: boolean = false
    ): ethers.Contract {
      if (needsSigner) {
        return new ethers.Contract(address, abi, this.signer);
      } else {
        return new ethers.Contract(address, abi, this.provider);
      }
    }

    /**
     * Send a transaction with automatic gas estimation
     */
    async sendTransaction(
      tx: ethers.TransactionRequest
    ): Promise<ethers.TransactionResponse> {
      console.log("📤 Sending transaction...");

      // Send transaction
      const response = await this.signer.sendTransaction(tx);
      console.log(`  Transaction hash: ${response.hash}`);

      return response;
    }

    /**
     * Wait for transaction confirmation
     */
    async waitForTransaction(
      tx: ethers.TransactionResponse,
      confirmations: number = 1
    ): Promise<ethers.TransactionReceipt | null> {
      console.log(`⏳ Waiting for ${confirmations} confirmation(s)...`);

      const receipt = await tx.wait(confirmations);

      if (receipt?.status === 1) {
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      } else {
        console.log(`❌ Transaction failed!`);
      }

      return receipt;
    }

    /**
     * Estimate gas for a contract function call
     */
    async estimateGas(
      contract: ethers.Contract,
      functionName: string,
      args: any[] = [],
      overrides: any = {}
    ): Promise<bigint> {
      const gasEstimate = await contract[functionName].estimateGas(...args, overrides);

      // Add 20% buffer
      const gasLimit = gasEstimate * 120n / 100n;

      console.log(`⛽ Gas estimate: ${gasEstimate.toString()} (with buffer: ${gasLimit.toString()})`);

      return gasLimit;
    }

    /**
     * Get formatted balance (in ETH)
     */
    async getFormattedBalance(address?: string): Promise<string> {
      const balance = await this.getBalance(address);
      return ethers.formatEther(balance);
    }

    /**
     * Send multiple transactions with nonce management
     */
    async sendMultipleTransactions(
      txs: ethers.TransactionRequest[]
    ): Promise<ethers.TransactionResponse[]> {
      const baseNonce = await this.getNonce();
      console.log(`📊 Base nonce: ${baseNonce}`);
      console.log(`📤 Sending ${txs.length} transactions in parallel...`);

      const txPromises = txs.map((tx, index) => {
        return this.signer.sendTransaction({
          ...tx,
          nonce: baseNonce + index
        });
      });

      const responses = await Promise.all(txPromises);

      console.log(`✅ All ${responses.length} transactions sent!`);
      responses.forEach((response, index) => {
        console.log(`  TX ${index + 1}: ${response.hash}`);
      });

      return responses;
    }
  }