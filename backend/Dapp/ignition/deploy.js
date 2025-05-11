// Import necessary modules
const { ethers } = require("hardhat");  // Import ethers.js library for interacting with Ethereum
const hre = require("hardhat");  // Import hardhat runtime environment
const fs = require("fs");  
const path = require("path");  

// Main function to deploy the smart contract
async function main() {
  // Get the deployer account (the first signer in the wallet)
  const [deployer] = await ethers.getSigners();

  // Get the balance of the deployer to check funds
  const balance = await deployer.getBalance();

  // Get the contract factory for the "AssestMarket" contract
  const AssestContract = await hre.ethers.getContractFactory("AssestMarket");

  // Deploy the contract to the Ethereum network
  const asstMarket = await AssestContract.deploy();

  // Wait for the contract to be deployed
  await asstMarket.deployed();

  const data = {
    address: asstMarket.address,
    abi: JSON.parse(asstMarket.interface.format('json'))
  }

  // Format the ABI with indentation
  const formattedData = JSON.stringify(data, null, 2); // 2 is the number of spaces for indentation
 
  //Replace this:
    //This writes the ABI and address to the mktplace.json
    // fs.writeFileSync('./src/Marketplace.json', JSON.stringify(data))

  //By this:
  // Automatically write the contract address and ABI to a JSON file in the frontend directory
  const frontendPath = path.join(__dirname, '../../../frontend/src/AssestContract.json');
  fs.writeFileSync(frontendPath, formattedData);  // Write the data into the file
}

// Execute the main function and handle any errors
main()
  .then(() => process.exit(0))  // Exit cleanly if the deployment succeeds
  .catch((error) => {
    console.error(error);  // Log any error that occurs
    process.exit(1);  // Exit with an error code
  });
