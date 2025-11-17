import { buildModule } from"@nomicfoundation/hardhat-ignition/modules";

const FamilyWalletModule = buildModule("FamilyWalletModule", (m) =>     
{
    // Get the deployer account (first account = your wallet)
    const deployer = m.getAccount(0);

    // Deploy FamilyWallet with deployer as owner
    const familyWallet = m.contract("FamilyWallet", [deployer]);

    return { familyWallet };
});

export default FamilyWalletModule;