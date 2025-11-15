// This is your original file, e.g., /app/bank/page.tsx or /pages/bank.tsx
// It is now much cleaner and imports the new components.

"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/WalletProvider";
import { getContract } from "@/lib/contract";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BankInfo, ValidationResult } from "@/components/bank/types"; // Import shared types

// Import the new components
import { ConnectWalletCard } from "@/components/bank/ConnectWalletCard";
import { AccessDeniedCard } from "@/components/bank/AccessDeniedCard";
import { PendingApprovalCard } from "@/components/bank/PendingApprovalCard";
import { DashboardHeader } from "@/components/bank/DashboardHeader";
import { BankInfoCard } from "@/components/bank/BankInfoCard";
import { KycValidationForm } from "@/components/bank/KycValidationForm";
import { ValidationResultCard } from "@/components/bank/ValidationResultCard";
import { KycInfoCard } from "@/components/bank/KycInfoCard";

export default function BankPage() {
  const { account } = useWallet();
  const [loading, setLoading] = useState(true);
  const [isBank, setIsBank] = useState(false);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [kycId, setKycId] = useState("");
  const [pan, setPan] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);

  useEffect(() => {
    if (account) {
      checkBankStatus();
    }
  }, [account]);

  async function checkBankStatus() {
    setLoading(true);
    try {
      const contract = await getContract();
      const isBankRegistered = await contract.isBank(account);

      if (isBankRegistered) {
        setIsBank(true);
        const bankData = await contract.getBankByAddress(account);
        setBankInfo({
          bName: bankData[0],
          addr: bankData[1],
          isApproved: bankData[2],
        });
      } else {
        setIsBank(false);
        setBankInfo(null);
      }
    } catch (error) {
      console.error("Error checking bank status:", error);
      toast.error("Failed to verify bank status. Are you on Sepolia network?");
    } finally {
      setLoading(false);
    }
  }

  async function handleValidateById() {
    if (!kycId) {
      toast.error("Please enter a KYC ID");
      return;
    }
    setSearchLoading(true);
    setResult(null);
    try {
      const contract = await getContract(true);
      const data = await contract.validateKYCById(kycId);
      setResult({
        customer: data[0],
        name: data[1],
        pan: data[2],
        isVerified: data[3],
        isRevoked: data[4],
      });
    } catch (error: any) {
      console.error("Error validating KYC:", error);
      const errorMessage =
        error.reason || "Customer not found or invalid KYC ID";
      toast.error(errorMessage);
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleValidateByPAN() {
    if (!pan) {
      toast.error("Please enter a PAN number");
      return;
    }
    setSearchLoading(true);
    setResult(null);
    try {
      const contract = await getContract(true);
      const data = await contract.validateKYCByPAN(pan);
      setResult({
        customer: data[0],
        name: data[1],
        pan: data[2],
        isVerified: data[3],
        isRevoked: data[4],
      });
    } catch (error: any) {
      console.error("Error validating KYC:", error);
      const errorMessage =
        error.reason || "Customer not found with this PAN number";
      toast.error(errorMessage);
    } finally {
      setSearchLoading(false);
    }
  }

  // Render states are now handled by dedicated components
  if (!account) {
    return <ConnectWalletCard />;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isBank) {
    return <AccessDeniedCard />;
  }

  if (bankInfo && !bankInfo.isApproved) {
    return <PendingApprovalCard bankInfo={bankInfo} />;
  }

  // The main dashboard, composed of the new components
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <DashboardHeader />

        {bankInfo && <BankInfoCard bankInfo={bankInfo} />}

        <KycValidationForm
          kycId={kycId}
          setKycId={setKycId}
          pan={pan}
          setPan={setPan}
          handleValidateById={handleValidateById}
          handleValidateByPAN={handleValidateByPAN}
          searchLoading={searchLoading}
        />

        {result && <ValidationResultCard result={result} />}

        <KycInfoCard />
      </div>
    </div>
  );
}
