
# Instruction

## NOTE
<span style="color: red">Change the password of mysql connection Add mnemonic then still deploy the contract</span>

## 🚀 Steps to Deploy the Project !!!

Step 1 -  Open terminal , enter git command to clone project:
```bash
git clone https://github.com/COS30049-SUVHN/group-project-spr-2025-g5.git
```

Step 2 - Direct to the directory frontend:
```bash
cd frontend
npm install
npm run dev
```

Step 3 - Direct to the directory backend/Api:
```bash
cd backend/Api
npm install
npm start
```

Step 4 - Direct to the directory backend/Dapp:
```bash
cd backend/Dapp
npm install
npx hardhat run ignition/deploy.js --network ganache
```

- A link http://localhost:5173/ will show to you after run "npm run dev"

<!-- # group_assignment_repo_init
# Contains the base directory structure -->
