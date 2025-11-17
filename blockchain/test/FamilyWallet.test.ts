  import { expect } from "chai";
  import { network } from "hardhat";

  const { ethers } = await network.connect();

  describe("FamilyWallet", function () {
    // Deployment fixture
    async function deployFamilyWalletFixture() {
      const [owner, alice, bob, carol] = await ethers.getSigners();       
      const FamilyWallet = await ethers.getContractFactory("FamilyWallet");
      const wallet = await FamilyWallet.deploy(owner.address);
      return { wallet, owner, alice, bob, carol };
    }

    describe("Deployment", function () {
      it("Should set the right owner", async function () {
        const { wallet, owner } = await deployFamilyWalletFixture();      
        expect(await wallet.owner()).to.equal(owner.address);
      });

      it("Should start with zero members", async function () {
        const { wallet } = await deployFamilyWalletFixture();
        expect(await wallet.getMemberCount()).to.equal(0);
      });

      it("Should start with zero balance", async function () {
        const { wallet } = await deployFamilyWalletFixture();
        expect(await wallet.getTotalBalance()).to.equal(0);
      });
    });


   describe("Member Management", function () {
      it("Owner can add a member", async function () {
        const { wallet, owner, alice } = await deployFamilyWalletFixture();

        await wallet.connect(owner).addMember(alice.address);

        expect(await wallet.isMember(alice.address)).to.be.true;
        expect(await wallet.getMemberCount()).to.equal(1);
      });

      it("Non-owner cannot add members", async function () {
        const { wallet, alice, bob } = await deployFamilyWalletFixture();

        try {
          await wallet.connect(alice).addMember(bob.address);
          expect.fail("Expected transaction to revert");
        } catch (error: any) {
          expect(error.message).to.include("OwnableUnauthorizedAccount");
        }
      });

      it("Cannot add zero address", async function () {
        const { wallet, owner } = await deployFamilyWalletFixture();      

        try {
          await wallet.connect(owner).addMember(ethers.ZeroAddress);      
          expect.fail("Expected transaction to revert");
        } catch (error: any) {
          expect(error.message).to.include("ZeroAddress");
        }
      });

      it("Cannot add same member twice", async function () {
        const { wallet, owner, alice } = await deployFamilyWalletFixture();

        await wallet.connect(owner).addMember(alice.address);

        try {
          await wallet.connect(owner).addMember(alice.address);
          expect.fail("Expected transaction to revert");
        } catch (error: any) {
          expect(error.message).to.include("AlreadyAMember");
        }
      });

      it("Non-owner cannot remove members", async function () {
        const { wallet, owner, alice, bob } = await deployFamilyWalletFixture();

        await wallet.connect(owner).addMember(alice.address);
        await wallet.connect(owner).addMember(bob.address);

        try {
          await wallet.connect(alice).removeMember(bob.address);
          expect.fail("Expected transaction to revert");
        } catch (error: any) {
          expect(error.message).to.include("OwnableUnauthorizedAccount");
        }
      });
      
    });

     describe("Deposits", function () {
      it("Member can deposit", async function () {
        const { wallet, owner, alice } = await deployFamilyWalletFixture();

        await wallet.connect(owner).addMember(alice.address);

        const depositAmount = ethers.parseEther("1.0");
        await wallet.connect(alice).deposit({ value: depositAmount });    

        expect(await wallet.getBalance(alice.address)).to.equal(depositAmount);
        expect(await wallet.getTotalBalance()).to.equal(depositAmount);
      });

      it("Non-member cannot deposit", async function () {
        const { wallet, alice } = await deployFamilyWalletFixture();      
        const depositAmount = ethers.parseEther("1.0");

        try {
          await wallet.connect(alice).deposit({ value: depositAmount });
          expect.fail("Expected transaction to revert");
        } catch (error: any) {
          expect(error.message).to.include("NotAMember");
        }
      });

      it("Cannot deposit zero amount", async function () {
        const { wallet, owner, alice } = await deployFamilyWalletFixture();

        await wallet.connect(owner).addMember(alice.address);

        try {
          await wallet.connect(alice).deposit({ value: 0 });
          expect.fail("Expected transaction to revert");
        } catch (error: any) {
          expect(error.message).to.include("ZeroAmount");
        }
      });
    });

    describe("Withdrawals", function () {
      it("Member can withdraw their balance", async function () {
        const { wallet, owner, alice } = await deployFamilyWalletFixture();

        await wallet.connect(owner).addMember(alice.address);
        const depositAmount = ethers.parseEther("1.0");
        await wallet.connect(alice).deposit({ value: depositAmount });    

        const withdrawAmount = ethers.parseEther("0.5");
        await wallet.connect(alice).withdraw(withdrawAmount);

        expect(await wallet.getBalance(alice.address)).to.equal(ethers.parseEther("0.5"));
      });

      it("Cannot withdraw more than balance", async function () {
        const { wallet, owner, alice } = await deployFamilyWalletFixture();

        await wallet.connect(owner).addMember(alice.address);
        await wallet.connect(alice).deposit({ value: ethers.parseEther("1.0") });

        try {
          await wallet.connect(alice).withdraw(ethers.parseEther("2.0"));
          expect.fail("Expected transaction to revert");
        } catch (error: any) {
          expect(error.message).to.include("InsufficientBalance");        
        }
      });

      it("Non-member cannot withdraw", async function () {
        const { wallet, alice } = await deployFamilyWalletFixture();      

        try {
          await wallet.connect(alice).withdraw(ethers.parseEther("1.0"));
          expect.fail("Expected transaction to revert");
        } catch (error: any) {
          expect(error.message).to.include("NotAMember");
        }
      });

      it("Owner can withdraw from member's balance", async function ()    
   {
        const { wallet, owner, alice } = await deployFamilyWalletFixture();

        await wallet.connect(owner).addMember(alice.address);
        await wallet.connect(alice).deposit({ value: ethers.parseEther("2.0") });

        // Owner withdraws from Alice's balance
        await wallet.connect(owner).ownerWithdraw(alice.address, ethers.parseEther("1.0"));

        expect(await wallet.getBalance(alice.address)).to.equal(ethers.parseEther("1.0"));
      });

    });   

   describe("Edge Cases", function () {
      it("Owner can add themselves as member", async function () {        
        const { wallet, owner } = await deployFamilyWalletFixture();      

        await wallet.connect(owner).addMember(owner.address);

        expect(await wallet.isMember(owner.address)).to.be.true;
      });

      it("Cannot withdraw zero amount", async function () {
        const { wallet, owner, alice } = await deployFamilyWalletFixture();

        await wallet.connect(owner).addMember(alice.address);
        await wallet.connect(alice).deposit({ value: ethers.parseEther("1.0") });

        try {
          await wallet.connect(alice).withdraw(0);
          expect.fail("Expected transaction to revert");
        } catch (error: any) {
          expect(error.message).to.include("ZeroAmount");
        }
      });

      it("Cannot remove non-existent member", async function () {
        const { wallet, owner, alice } = await deployFamilyWalletFixture();

        try {
          await wallet.connect(owner).removeMember(alice.address);        
          expect.fail("Expected transaction to revert");
        } catch (error: any) {
          expect(error.message).to.include("NotAMember");
        }
      });

      it("getMembers returns correct list", async function () {
        const { wallet, owner, alice, bob } = await deployFamilyWalletFixture();

        await wallet.connect(owner).addMember(alice.address);
        await wallet.connect(owner).addMember(bob.address);

        const members = await wallet.getMembers();
        expect(members.length).to.equal(2);
        expect(members).to.include(alice.address);
        expect(members).to.include(bob.address);
      });
    });    

  });
