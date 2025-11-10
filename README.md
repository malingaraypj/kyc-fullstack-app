# Blockchain KYC Management System

A decentralized KYC (Know Your Customer) management system built on Ethereum Sepolia testnet. This application allows customers to submit KYC applications with document uploads to IPFS, admins to verify applications, and banks to validate approved customers.

## 🚀 Features

- **Customer Dashboard**: Submit KYC applications and track verification status
- **Admin Dashboard**: Review, approve, reject, and revoke KYC applications
- **Bank Dashboard**: Validate customer KYC status by KYC ID or PAN number
- **Wallet Integration**: Connect with MetaMask for blockchain interactions
- **Real-time Updates**: All actions recorded on Sepolia testnet
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 📋 Prerequisites

Before you begin, ensure you have the following:

1. **MetaMask Browser Extension**: Install from [metamask.io](https://metamask.io/)
2. **Sepolia Test ETH**: Get free test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. **Deployed Smart Contract**: Deploy the KYC contract on Sepolia testnet using Remix IDE
4. **Pinata Account**: For IPFS document storage - Sign up at [pinata.cloud](https://www.pinata.cloud/)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Configure Smart Contract

Open `src/lib/contract.ts` and update:

```typescript
// Replace with your deployed contract address from Remix
export const CONTRACT_ADDRESS = '0xYourContractAddressHere';

// The ABI is already configured, but verify it matches your contract
export const CONTRACT_ABI = [ /* ... */ ];
```

**How to get these values:**
- Deploy your smart contract in Remix IDE on Sepolia testnet
- Copy the deployed contract address
- Go to "Solidity Compiler" tab → "Compilation Details" → Copy the ABI JSON array

### 3. Configure IPFS (Pinata)

**Why Pinata?** Documents uploaded by customers need to be stored on IPFS (InterPlanetary File System) for decentralized, tamper-proof storage. Pinata provides a reliable gateway to IPFS.

**Setup Steps:**

1. **Create Pinata Account**: Go to [pinata.cloud](https://www.pinata.cloud/) and sign up
2. **Generate API Key**:
   - Navigate to **API Keys** section
   - Click **New Key**
   - Enable **pinFileToIPFS** permission
   - Give it a name (e.g., "KYC DApp")
   - Copy the **JWT token** (you'll only see this once!)

3. **Create Environment File**:
   ```bash
   cp .env.local.example .env.local
   ```

4. **Add Pinata JWT**:
   Open `.env.local` and add your JWT:
   ```bash
   NEXT_PUBLIC_PINATA_JWT=your_actual_jwt_token_here
   ```

### 4. Run the Application

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Application Structure

```
src/
├── app/
│   ├── page.tsx           # Homepage with role selection
│   ├── customer/          # Customer dashboard
│   ├── admin/             # Admin dashboard
│   ├── bank/              # Bank dashboard
│   └── layout.tsx         # Root layout with wallet provider
├── components/
│   ├── Navigation.tsx     # Top navigation bar
│   └── ui/                # Shadcn/UI components
└── lib/
    ├── contract.ts        # Smart contract integration
    └── WalletProvider.tsx # Wallet connection context
```

## 🎯 How to Use

### For Customers

1. **Connect Wallet**: Click "Connect Wallet" in the navigation
2. **Submit KYC**: Go to Customer dashboard and fill in the form:
   - Full Name
   - Email Address
   - PAN Number
   - Aadhaar Number
   - Address Proof (IPFS link or URL)
3. **Track Status**: View your application status (Pending/Verified/Revoked)

### For Admins

1. **Connect Admin Wallet**: Use the wallet address that deployed the contract
2. **Review Applications**: Go to Admin dashboard to see all applications
3. **Take Action**:
   - **Verify**: Approve pending applications
   - **Reject**: Reject applications that don't meet criteria
   - **Revoke**: Revoke previously verified KYCs

### For Banks

1. **Connect Wallet**: Any wallet can access bank dashboard
2. **Validate KYC**:
   - Search by **KYC ID** (e.g., 1, 2, 3...)
   - Search by **PAN Number** (e.g., ABCDE1234F)
3. **View Status**: See customer details and verification status

## 🔐 Smart Contract Requirements

Your smart contract should include these functions:

### Customer Functions
- `applyForKYC(name, email, pan, aadhaar, addressProof)`
- `getCustomerKYC(address)` → Returns customer KYC data

### Admin Functions
- `verifyKYC(address)` → Approve a KYC application
- `rejectKYC(address)` → Reject a KYC application
- `revokeKYC(address)` → Revoke an approved KYC
- `getAllCustomers()` → Get all customer addresses
- `admin()` → Returns admin address

### Bank Functions
- `validateKYCById(kycId)` → Get customer details by KYC ID
- `validateKYCByPAN(pan)` → Get customer details by PAN

## 🌐 Network Configuration

The application is configured for **Sepolia Testnet**:
- Chain ID: 11155111 (0xaa36a7)
- RPC URL: https://rpc.sepolia.org
- Block Explorer: https://sepolia.etherscan.io

The app will automatically prompt you to switch networks if you're on a different chain.

## 📚 Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Ethers.js** - Ethereum library
- **Tailwind CSS** - Styling
- **Shadcn/UI** - UI components
- **Sonner** - Toast notifications

## 🐛 Troubleshooting

### IPFS Upload Issues

**Error**: "Pinata credentials not configured"
- **Solution**: Make sure you've created `.env.local` file and added `NEXT_PUBLIC_PINATA_JWT`
- Restart the dev server after adding environment variables

**Error**: "Failed to upload file to IPFS"
- **Solution**: 
  - Verify your Pinata JWT is valid
  - Check if your Pinata account has sufficient storage/bandwidth
  - Ensure file size is under 10MB

### Contract Interaction Issues

**Error**: "Please connect your wallet"
- **Solution**: Install MetaMask and connect to Sepolia testnet

**Error**: "Insufficient funds"
- **Solution**: Get free Sepolia ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

**Error**: "Transaction failed"
- **Solution**: 
  - Check if contract address is correct
  - Verify you're on Sepolia testnet
  - Ensure you have enough gas fees

## 📝 Next Steps

1. ✅ Update `CONTRACT_ADDRESS` in `src/lib/contract.ts`
2. ✅ Update `CONTRACT_ABI` in `src/lib/contract.ts`
3. ✅ Get Sepolia ETH from a faucet
4. ✅ Deploy your smart contract on Sepolia testnet
5. ✅ Start using the application!

## 🤝 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your smart contract is deployed correctly
3. Ensure you're on Sepolia testnet
4. Check that your wallet has sufficient ETH

## 📄 License

MIT License - feel free to use this project for your blockchain applications!

---

Built with ❤️ using Next.js and Ethereum

## How Document Upload Works

### Customer Flow:
1. Customer fills in KYC form (name, PAN number)
2. **Uploads Aadhaar document** → Automatically uploaded to IPFS via Pinata
3. **Uploads PAN document** → Automatically uploaded to IPFS via Pinata
4. Both IPFS hashes (e.g., `ipfs://Qm...`) are stored on the blockchain
5. Submits application → Transaction recorded on Sepolia blockchain

### Document Storage:
- **File Types Supported**: JPG, PNG, PDF
- **Max File Size**: 10MB per document
- **Storage**: Decentralized IPFS network via Pinata
- **Security**: Files are content-addressed (hash-based), making them tamper-proof
- **Access**: Anyone with the IPFS hash can view the document (ensure documents are appropriately redacted if needed)

### Admin Verification:
- Admin can view all submitted documents via IPFS links
- Approve or reject applications based on document verification
- All actions recorded on blockchain with transparency

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Required for IPFS document uploads
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token

# Alternative (if not using JWT):
# NEXT_PUBLIC_PINATA_API_KEY=your_api_key
# NEXT_PUBLIC_PINATA_SECRET_KEY=your_secret_key
```

**Note**: The `NEXT_PUBLIC_` prefix makes these variables accessible in the browser. Since IPFS uploads happen client-side, this is necessary. Never expose sensitive backend credentials with this prefix.