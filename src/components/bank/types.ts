// src/components/bank/types.ts

// From your original file
export interface BankInfo {
  bName: string;
  addr: string;
  isApproved: boolean;
}

// Based on your contract/page logic
export interface ValidationResult {
  customer: string;
  name: string;
  pan: string;
  isVerified: boolean;
  isRevoked: boolean;
}
