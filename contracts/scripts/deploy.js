const hre = require("hardhat");
const contractOwner = require("../../frontend/constants/contractOwner.json");

async function main() {
  // Semaphore verifier
  const VerifierContract = await hre.ethers.getContractFactory("Verifier");
  const verifier = await VerifierContract.deploy();

  await verifier.deployed();
  console.log("Semaphore verifier deployed to:", verifier.address);

  // // identity verifier
  // const IdentityVerifier = await hre.ethers.getContractFactory(
  //   "IdentiyVerifier"
  // );
  // const identityVerifier = await IdentityVerifier.deploy();

  // await identityVerifier.deployed();

  // console.log("IdentityVerifier deployed to:", identityVerifier.address);

  const ZkNews = await hre.ethers.getContractFactory("zkNews");
  const zkNews = await ZkNews.deploy(verifier.address);

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
