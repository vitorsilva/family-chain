  import { expect } from "chai";
  import { network } from "hardhat";

  const { ethers } = await network.connect();

  describe("FamilyWallet - Gas Analysis", function () {
    async function deployFixture() {
      const [owner, addr1, addr2] = await ethers.getSigners();
      const FamilyWallet = await ethers.getContractFactory("FamilyWallet");
      const wallet = await FamilyWallet.deploy(owner.address); // ✅ Pass owner

      // Add addr1 as a member
      await wallet.addMember(addr1.address);

      return { wallet, owner, addr1, addr2 };
    }

    it("Should track gas for addMember", async function () {
      const { wallet, addr2 } = await deployFixture();

      const tx = await wallet.addMember(addr2.address);
      const receipt = await tx.wait();

      const gasUsed = receipt?.gasUsed ?? 0n;
      console.log(`\n  👥 addMember gas used: ${gasUsed.toString()}`);
    });

    it("Should track gas for deposit transaction", async function () {
      const { wallet, addr1 } = await deployFixture();

      const tx = await wallet.connect(addr1).deposit({
        value: ethers.parseEther("0.1")
      });

      const receipt = await tx.wait();
      const gasUsed = receipt?.gasUsed ?? 0n;
      console.log(`\n  💰 deposit gas used: ${gasUsed.toString()}`);
    });

    it("Should track gas for withdrawal transaction", async function () {
      const { wallet, addr1 } = await deployFixture();

      // First deposit
      await wallet.connect(addr1).deposit({ value: ethers.parseEther("0.1") });

      // Then withdraw
      const tx = await wallet.connect(addr1).withdraw(ethers.parseEther("0.05"));
      const receipt = await tx.wait();

      const gasUsed = receipt?.gasUsed ?? 0n;
      console.log(`\n  💸 withdraw gas used: ${gasUsed.toString()}`);
    });

    it("Should compare gas: first deposit vs. second deposit", async function () {
      const { wallet, addr1 } = await deployFixture();

      // First deposit (writes to empty storage slot)
      const tx1 = await wallet.connect(addr1).deposit({ value: ethers.parseEther("0.1") });    
      const receipt1 = await tx1.wait();
      const gas1 = receipt1?.gasUsed ?? 0n;

      // Second deposit (updates existing storage slot)
      const tx2 = await wallet.connect(addr1).deposit({ value: ethers.parseEther("0.1") });    
      const receipt2 = await tx2.wait();
      const gas2 = receipt2?.gasUsed ?? 0n;

      console.log(`\n  📊 Gas Comparison:`);
      console.log(`     First deposit (write new):     ${gas1.toString()} gas`);
      console.log(`     Second deposit (update):       ${gas2.toString()} gas`);
      console.log(`     Difference:                    ${(gas1 - gas2).toString()} gas
  saved`);

      // First write costs more than update
      expect(gas1).to.be.greaterThan(gas2, "First write should cost more than update");        
    });
  });