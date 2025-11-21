import { ethers, Log } from "ethers";
import { network } from "hardhat";

// FamilyWallet contract address (Sepolia)
const FAMILY_WALLET_ADDRESS = "0xaa8ffF534A8BC8a6e6C8AEad795d5a5E373e716e";

// Minimal ABI (just deposit function and event)
const FAMILY_WALLET_ABI = [
"function deposit() public payable",
"event Deposited(address indexed member, uint256 amount, uint256 newBalance, uint256 timestamp)",
];

async function backendDeposit() {
console.log("=== Backend Deposit to FamilyWallet ===\n");

// Connect to network
const connection = await network.connect("sepolia");
const provider = connection.ethers.provider;

// Load signer from Hardhat keystore
const [signer] = await connection.ethers.getSigners();
const address = await signer.getAddress();

console.log("👤 Signer Address:", address);
console.log("");

// Check balance before
const balanceBefore = await provider.getBalance(address);
console.log("💰 Wallet Balance Before:", ethers.formatEther(balanceBefore), "ETH");
console.log("");

// Create contract instance with SIGNER (not just provider)
const contract = new ethers.Contract(
    FAMILY_WALLET_ADDRESS,
    FAMILY_WALLET_ABI,
    signer // ✅ Signer required for writing!
);

// Deposit amount
const depositAmount = ethers.parseEther("0.0001"); // 0.0001 ETH (small for testing)
console.log("📤 Depositing:", ethers.formatEther(depositAmount), "ETH");
console.log("");

// Estimate gas first
console.log("⛽ Estimating gas...");
const gasEstimate = await contract.deposit.estimateGas({
    value: depositAmount
});
console.log("  Estimated gas:", gasEstimate.toString());

// Add 20% buffer
const gasLimit = gasEstimate * 120n / 100n;
console.log("  Gas limit (with buffer):", gasLimit.toString());
console.log("");

// Send transaction
console.log("📝 Sending transaction...");
const tx = await contract.deposit({
    value: depositAmount,
    gasLimit
});

console.log("  Transaction hash:", tx.hash);
console.log("  Waiting for confirmation...");
console.log("");

// Wait for confirmation
const receipt = await tx.wait();

if (receipt.status === 1) {
    console.log("✅ Transaction confirmed!");
    console.log("  Block number:", receipt.blockNumber);
    console.log("  Gas used:", receipt.gasUsed.toString());
    console.log("  Gas price:", ethers.formatUnits(receipt.gasPrice, "gwei"), "gwei");
    console.log("");

    // Calculate cost
    const gasCost = receipt.gasUsed * receipt.gasPrice;
    const totalCost = BigInt(depositAmount) + BigInt(gasCost);
    console.log("💸 Cost Breakdown:");
    console.log("  Deposit amount:", ethers.formatEther(depositAmount), "ETH");
    console.log("  Gas cost:", ethers.formatEther(gasCost), "ETH");
    console.log("  Total cost:", ethers.formatEther(totalCost), "ETH");
    console.log("");

    // Check balance after
    const balanceAfter = await provider.getBalance(address);
    console.log("💰 Wallet Balance After:", ethers.formatEther(balanceAfter), "ETH");
    console.log("  Difference:", ethers.formatEther(balanceBefore - balanceAfter), "ETH");      
    console.log("");

    // Parse event from receipt
    const depositEvent = receipt.logs
    .map((log : Log)  => {
        try {
        return contract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
        });
        } catch {
        return null;
        }
    })
    .find((event : any) => event?.name === "Deposited");

    if (depositEvent) {
    console.log("📋 Event Data:");
    console.log("  Member:", depositEvent.args.member);
    console.log("  Amount:", ethers.formatEther(depositEvent.args.amount), "ETH");
    console.log("  New Balance:", ethers.formatEther(depositEvent.args.newBalance),
"ETH");
    console.log("  Timestamp:", new Date(Number(depositEvent.args.timestamp) *
1000).toLocaleString());
    }

    console.log("");
    console.log("🎉 Backend deposit successful!");
    console.log("🔗 View on Etherscan:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
} else {
    console.log("❌ Transaction failed!");
}
}

backendDeposit()
.then(() => process.exit(0))
.catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});