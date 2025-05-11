// Import necessary modules for testing
const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");  // Helper functions for time manipulation and fixture loading
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs"); // Helper for handling arguments in events
const { expect } = require("chai");  // Chai for assertions

// Test Suite for "Lock" contract
describe("Lock", function () {
  // Define a fixture to reuse the same setup in every test. The fixture deploys the contract with predefined conditions.
  // `loadFixture` helps us run this setup once, snapshot the state, and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;  // 1 year in seconds
    const ONE_GWEI = 1_000_000_000;  // 1 Gwei = 1,000,000,000 wei

    const lockedAmount = ONE_GWEI;  // Set the locked amount to 1 Gwei
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;  // Set unlock time to 1 year from the current time

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();  // Get the two accounts for testing

    const Lock = await ethers.getContractFactory("Lock");  // Get the contract factory for "Lock"
    const lock = await Lock.deploy(unlockTime, { value: lockedAmount });  // Deploy the contract with the specified unlock time and locked amount

    return { lock, unlockTime, lockedAmount, owner, otherAccount };  // Return the contract instance, unlockTime, and other variables for use in tests
  }

  describe("Deployment", function () {
    // Test case to check if the unlockTime was correctly set during deployment
    it("Should set the right unlockTime", async function () {
      const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);

      // Assert that the unlockTime set in the contract matches the one defined during deployment
      expect(await lock.unlockTime()).to.equal(unlockTime);
    });

    // Test case to check if the owner of the contract is correctly set
    it("Should set the right owner", async function () {
      const { lock, owner } = await loadFixture(deployOneYearLockFixture);

      // Assert that the owner of the contract matches the account that deployed the contract
      expect(await lock.owner()).to.equal(owner.address);
    });

    // Test case to check if the funds are correctly locked in the contract
    it("Should receive and store the funds to lock", async function () {
      const { lock, lockedAmount } = await loadFixture(deployOneYearLockFixture);

      // Assert that the contract's balance matches the lockedAmount
      expect(await ethers.provider.getBalance(lock.target)).to.equal(lockedAmount);
    });

    // Test case to ensure the unlockTime is in the future when deploying the contract
    it("Should fail if the unlockTime is not in the future", async function () {
      const latestTime = await time.latest();  // Get the current time
      const Lock = await ethers.getContractFactory("Lock");  // Get the contract factory for "Lock"
      
      // Assert that the contract deployment fails if the unlockTime is not in the future
      await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith("Unlock time should be in the future");
    });
  });


  describe("Withdrawals", function () {
    describe("Validations", function () {
      // Test case to check if the withdrawal fails when called too soon (before unlockTime)
      it("Should revert with the right error if called too soon", async function () {
        const { lock } = await loadFixture(deployOneYearLockFixture);

        // Assert that calling withdraw before the unlock time results in a revert with the specified error message
        await expect(lock.withdraw()).to.be.revertedWith("You can't withdraw yet");
      });

      // Test case to check if the withdrawal fails when called from an account other than the owner
      it("Should revert with the right error if called from another account", async function () {
        const { lock, unlockTime, otherAccount } = await loadFixture(deployOneYearLockFixture);

        // Increase time to the unlock time
        await time.increaseTo(unlockTime);

        // Use lock.connect() to send a transaction from another account
        await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith("You aren't the owner");
      });

      it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
        const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);

        // Increase time to the unlock time
        await time.increaseTo(unlockTime);

        // Assert that the withdrawal does not revert when the unlock time has arrived and the owner calls it
        await expect(lock.withdraw()).not.to.be.reverted;
      });
    });

    describe("Events", function () {
      // Test case to check if the withdrawal emits the correct event
      it("Should emit an event on withdrawals", async function () {
        const { lock, unlockTime, lockedAmount } = await loadFixture(deployOneYearLockFixture);

        // Increase time to the unlock time
        await time.increaseTo(unlockTime);

        // Assert that the Withdrawal event is emitted with the correct arguments
        await expect(lock.withdraw()).to.emit(lock, "Withdrawal").withArgs(lockedAmount, anyValue);
      });
    });

    describe("Transfers", function () {
      // Test case to check if the funds are correctly transferred to the owner
      it("Should transfer the funds to the owner", async function () {
        const { lock, unlockTime, lockedAmount, owner } = await loadFixture(deployOneYearLockFixture);

        // Increase time to the unlock time
        await time.increaseTo(unlockTime);

        // Assert that the balances change correctly after withdrawal
        await expect(lock.withdraw()).to.changeEtherBalances([owner, lock], [lockedAmount, -lockedAmount]);
      });
    });
  });
});
