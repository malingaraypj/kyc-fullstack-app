// These types are used by the page and several components
export interface BankInfo {
  bName: string;
  addr: string;
  isApproved: boolean;
}

export interface ValidationResult {
  customer: string;
  name: string;
  pan: string;
  isVerified: boolean;
  isRevoked: boolean;
}
