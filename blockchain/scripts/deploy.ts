import { network } from "hardhat";

const { ethers } = await network.connect();

  async function main() {
    console.log("Deploying HelloFamily contract...");

    const HelloFamily = await ethers.getContractFactory("HelloFamily");
    const helloFamily = await HelloFamily.deploy("Hello, Family!");

    await helloFamily.waitForDeployment();

    const address = await helloFamily.getAddress();
    console.log("HelloFamily deployed to:", address);
  }

  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });