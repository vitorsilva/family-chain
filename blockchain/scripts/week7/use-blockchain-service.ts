 import { ethers } from "ethers";
 import { BlockchainService } from "../../services/BlockchainService.js";

  const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";
  const FAMILY_WALLET_ABI = [
    "function deposit() public payable",
    "function getBalance(address member) external view returns (uint256)",
  ];

  async function useBlockchainService() {
    console.log("=== Using Blockchain Service ===\n");

    // Initialize service
    const service = new BlockchainService();
    await service.initialize("sepolia");
    console.log("");

    // Check balance before
    const balanceBefore = await service.getFormattedBalance();
    console.log("💰 Wallet Balance:", balanceBefore, "ETH");
    console.log("");

    // Get contract instance (with signer)
    const contract = service.getContract(
      FAMILY_WALLET_ADDRESS,
      FAMILY_WALLET_ABI,
      true // needsSigner = true
    );

    // Estimate gas
    const depositAmount = ethers.parseEther("0.0001");
    const gasLimit = await service.estimateGas(
      contract,
      "deposit",
      [],
      { value: depositAmount }
    );
    console.log("");

    // Send transaction
    const tx = await contract.deposit({
      value: depositAmount,
      gasLimit
    });

    // Wait for confirmation
    const receipt = await service.waitForTransaction(tx);
    console.log("");

    if (receipt?.status === 1) {
      // Query contract balance (read-only)
      const contractReadOnly = service.getContract(
        FAMILY_WALLET_ADDRESS,
        FAMILY_WALLET_ABI,
        false // needsSigner = false (read-only)
      );

      const contractBalance = await contractReadOnly.getBalance(service.getAddress());
      console.log("🏦 Contract Balance:", ethers.formatEther(contractBalance), "ETH");
      console.log("");

      console.log("🎉 Service demo complete!");
      console.log("💡 Key benefit: Reusable, clean, testable code");
    }
  }

  useBlockchainService()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });