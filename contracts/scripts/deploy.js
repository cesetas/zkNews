const hre = require("hardhat");
const contractOwner = require("../../frontend/constants/contractOwner.json");

async function main() {
  console.log(contractOwner.address);
  const ZkNews = await hre.ethers.getContractFactory("zkNews");
  const zkNews = await ZkNews.deploy(contractOwner.address);

  await zkNews.deployed();

  console.log("zkNews deployed to:", zkNews.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
