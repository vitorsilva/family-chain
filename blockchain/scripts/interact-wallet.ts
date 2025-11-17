 import { network } from "hardhat";

  async function main() {
    const { ethers } = await network.connect();

    // Your deployed contract address
    const contractAddress = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";

    // Get the contract instance
    const FamilyWallet = await ethers.getContractFactory("FamilyWallet");
    const wallet = FamilyWallet.attach(contractAddress);

    // Get signer (your account)
    const [signer] = await ethers.getSigners();
    console.log("Using account:", signer.address);

    // Check if owner
    const owner = await wallet.owner();
    console.log("Contract owner:", owner);
    console.log("You are owner:", signer.address.toLowerCase() === owner.toLowerCase());

    // Check current members
    const memberCount = await wallet.getMemberCount();
    console.log("Current member count:",memberCount.toString());

    // Add yourself as a member (if not already)
    const isMember = await wallet.isMember(signer.address);
    if (!isMember) {
      console.log("\nAdding yourself as a member...");
      const tx = await wallet.addMember(signer.address);
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("You are now a family member!");
    } else {
      console.log("\nYou are already a member!");
    }

    // Check balance before deposit
    const balanceBefore = await wallet.getBalance(signer.address);
    console.log("\nYour balance in contract:", ethers.formatEther(balanceBefore), "ETH");

    // Deposit 0.001 ETH
    console.log("\nDepositing 0.001 ETH...");
    const depositTx = await wallet.deposit({ value: ethers.parseEther("0.001") });
    console.log("Deposit transaction hash:", depositTx.hash);
    await depositTx.wait();

    // Check balance after deposit
    const balanceAfter = await wallet.getBalance(signer.address);
    console.log("Your new balance:", ethers.formatEther(balanceAfter), "ETH");

    // Check contract total balance
    const totalBalance = await wallet.getTotalBalance();
    console.log("Contract total balance:", ethers.formatEther(totalBalance), "ETH");
  }

  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });