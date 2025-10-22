import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();
describe("HelloFamily", function () {
    it("Should return the correct greeting message", async function () {
        const HelloFamily = await ethers.getContractFactory("HelloFamily");
        const helloFamily = await HelloFamily.deploy("Hello, Family!");

        expect(await helloFamily.greeting()).to.equal("Hello, Family!");
    });
    it("Owner is set correctly", async function () {
        const [owner] = await ethers.getSigners();
        const HelloFamily = await ethers.getContractFactory("HelloFamily");
        const helloFamily = await HelloFamily.deploy("Hello, Family!");
        const contractOwner = await helloFamily.owner();
        expect(contractOwner).to.equal(owner.address);
    });
    it("Owner can change the greeting", async function () {
        const [owner] = await ethers.getSigners();
        const HelloFamily = await ethers.getContractFactory("HelloFamily");
        const helloFamily = await HelloFamily.deploy("Hello, Family!");
        await helloFamily.setGreeting("Hello, Family2!");
        expect(await helloFamily.greeting()).to.equal("Hello, Family2!");
    });
    it("Non-owner CANNOT change the greeting", async function () {
        const [owner, addr1] = await ethers.getSigners();
        const HelloFamily = await ethers.getContractFactory("HelloFamily");
        const helloFamily = await HelloFamily.deploy("Hello, Family!");

        await expect(helloFamily.connect(addr1).setGreeting("New Greeting")).to.be.revertedWith("Only owner can set greeting");
    });
    it("Event is emitted when greeting changes", async function () {
        const [owner] = await ethers.getSigners();
        const HelloFamily = await ethers.getContractFactory("HelloFamily");
        const helloFamily = await HelloFamily.deploy("Hello, Family!");

        await expect(helloFamily.connect(owner).setGreeting("New Greeting")).to.emit(helloFamily, "GreetingChanged").withArgs("New Greeting", owner);
    });
});
