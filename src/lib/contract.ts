import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x04bef941fcfa6c4839898d9ff2e60894eb7d5bdd";

// ABI for KYC Smart Contract
export const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_addr",
        type: "address",
      },
    ],
    name: "addAdmin",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AadhaarHashUsed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_bName",
        type: "string",
      },
      {
        internalType: "address",
        name: "_addr",
        type: "address",
      },
    ],
    name: "addBank",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "AdminAccessRevoked",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyAdmin",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyBank",
    type: "error",
  },
  {
    inputs: [],
    name: "BankNotApproved",
    type: "error",
  },
  {
    inputs: [],
    name: "BankNotFound",
    type: "error",
  },
  {
    inputs: [],
    name: "CustomerExists",
    type: "error",
  },
  {
    inputs: [],
    name: "CustomerNotFound",
    type: "error",
  },
  {
    inputs: [],
    name: "IndexOutOfBounds",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidField",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidKycId",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidPan",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidTransition",
    type: "error",
  },
  {
    inputs: [],
    name: "NotAdmin",
    type: "error",
  },
  {
    inputs: [],
    name: "NotApplicant",
    type: "error",
  },
  {
    inputs: [],
    name: "OnlyAdmin",
    type: "error",
  },
  {
    inputs: [],
    name: "OnlyBank",
    type: "error",
  },
  {
    inputs: [],
    name: "PanExists",
    type: "error",
  },
  {
    inputs: [],
    name: "PanHashUsed",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "adminAddress",
        type: "address",
      },
    ],
    name: "AdminAdded",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_kycId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_remarks",
        type: "string",
      },
      {
        internalType: "bytes32",
        name: "_vcHash",
        type: "bytes32",
      },
    ],
    name: "adminApprove",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_kycId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_remarks",
        type: "string",
      },
    ],
    name: "adminReject",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "adminAddress",
        type: "address",
      },
    ],
    name: "AdminRemoved",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_kycId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_remarks",
        type: "string",
      },
    ],
    name: "adminRevoke",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "kycId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "remarks",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "vcHash",
        type: "bytes32",
      },
    ],
    name: "ApplicationApproved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "kycId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "remarks",
        type: "string",
      },
    ],
    name: "ApplicationRejected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "kycId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "remarks",
        type: "string",
      },
    ],
    name: "ApplicationRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "kycIdHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "kycId",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "applicant",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "pan",
        type: "string",
      },
    ],
    name: "ApplicationSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "kycId",
        type: "string",
      },
    ],
    name: "ApplicationUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "bankAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "BankAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "bankAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isApproved",
        type: "bool",
      },
    ],
    name: "BankApprovalSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "kycId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isVisible",
        type: "bool",
      },
    ],
    name: "CustomerAdminVisibilitySet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "kycId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "recordType",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "recordData",
        type: "string",
      },
    ],
    name: "RecordUpdated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_addr",
        type: "address",
      },
    ],
    name: "removeAdmin",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_kycId",
        type: "string",
      },
      {
        internalType: "bool",
        name: "_visible",
        type: "bool",
      },
    ],
    name: "setAdminVisibility",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_bank",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_approved",
        type: "bool",
      },
    ],
    name: "setBankApproval",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_kycId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_pan",
        type: "string",
      },
      {
        internalType: "string",
        name: "_ipfsAadhar",
        type: "string",
      },
      {
        internalType: "string",
        name: "_ipfsPan",
        type: "string",
      },
      {
        internalType: "bytes32",
        name: "_aadhaarHash",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_panHash",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_vcHash",
        type: "bytes32",
      },
    ],
    name: "submitApplication",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_kycId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_ipfsAadhar",
        type: "string",
      },
      {
        internalType: "string",
        name: "_ipfsPan",
        type: "string",
      },
    ],
    name: "updateMyApplication",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "bankIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "BankList",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "Banks",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "bName",
        type: "string",
      },
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isApproved",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "CustomerList",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_kycId",
        type: "string",
      },
    ],
    name: "getAdminVisibility",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllCustomersCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_kycId",
        type: "string",
      },
    ],
    name: "getApprovedCustomerBasic",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "pan",
        type: "string",
      },
      {
        internalType: "bytes32",
        name: "vcHash",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "getBankByAddress",
    outputs: [
      {
        internalType: "string",
        name: "bName",
        type: "string",
      },
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isApproved",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getCustomerAt",
    outputs: [
      {
        internalType: "string",
        name: "kycId",
        type: "string",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "pan",
        type: "string",
      },
      {
        internalType: "address",
        name: "applicant",
        type: "address",
      },
      {
        internalType: "enum KYC.Status",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "vcHash",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "createdAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "updatedAt",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_kycId",
        type: "string",
      },
    ],
    name: "getCustomerHistoryCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_kycId",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getCustomerHistoryEntry",
    outputs: [
      {
        internalType: "string",
        name: "remarks",
        type: "string",
      },
      {
        internalType: "enum KYC.Status",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "time",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_kycId",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getCustomerRecord",
    outputs: [
      {
        internalType: "string",
        name: "kind",
        type: "string",
      },
      {
        internalType: "string",
        name: "data",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "time",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_kycId",
        type: "string",
      },
    ],
    name: "getCustomerRecordsCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "isAadhaarHashUsed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isAdmin",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_kycId",
        type: "string",
      },
    ],
    name: "isApprovedByKycId",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_pan",
        type: "string",
      },
    ],
    name: "isApprovedByPan",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isBank",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "isCustomer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "isCustomerFromPAN",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "isPanHashUsed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "kycIdByApplicant",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "kycIdByPAN",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_kycId",
        type: "string",
      },
    ],
    name: "validateKYCById",
    outputs: [
      {
        internalType: "address",
        name: "customer",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "pan",
        type: "string",
      },
      {
        internalType: "bool",
        name: "isVerified",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isRevoked",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_pan",
        type: "string",
      },
    ],
    name: "validateKYCByPAN",
    outputs: [
      {
        internalType: "address",
        name: "customer",
        type: "address",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "pan",
        type: "string",
      },
      {
        internalType: "bool",
        name: "isVerified",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isRevoked",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function getProvider() {
  if (typeof window !== "undefined" && window.ethereum) {
    return window.ethereum;
  }
  return null;
}

export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  } catch (error: any) {
    throw new Error(error.message || "Failed to connect wallet");
  }
}

export async function getContract(admin?: boolean) {
  // Get the signer
  const provider = new ethers.BrowserProvider(window.ethereum!);
  const signer = admin ? await provider.getSigner() : null;

  // Create and return contract instance
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer || provider
  );
}
