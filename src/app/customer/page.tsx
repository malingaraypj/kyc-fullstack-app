"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/WalletProvider";
import { getContract } from "@/lib/contract";
import { ConnectWalletMessage } from "@/components/customer/ConnectWalletMessage";
import { ApplicationStatusCard } from "@/components/customer/ApplicationStatusCard";
import { ApplicationForm } from "@/components/customer/ApplicationForm";

export default function CustomerPage() {
  const { account } = useWallet();
  const [hasApplication, setHasApplication] = useState(false);
  const [kycId, setKycId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (account) {
      setIsLoading(true);
      checkExistingApplication();
    } else {
      setIsLoading(false); // Not loading if no account
    }
  }, [account]);

  async function checkExistingApplication() {
    try {
      const contract = await getContract();
      const existingKycId = await contract.kycIdByApplicant(account);

      if (existingKycId && existingKycId !== "") {
        setHasApplication(true);
        setKycId(existingKycId);
      } else {
        setHasApplication(false);
        setKycId("");
      }
    } catch (error) {
      console.error("Error checking application:", error);
      setHasApplication(false); // Assume no application on error
    } finally {
      setIsLoading(false);
    }
  }

  // Helper function to render content based on state
  const renderContent = () => {
    // 1. Handle No Wallet
    if (!account) {
      return <ConnectWalletMessage />;
    }

    // 2. Handle Loading State (while checking for application)
    // You can add a spinner here if you want
    if (isLoading) {
      return null; // or <Spinner />
    }

    // 3. Handle Existing Application
    if (hasApplication) {
      return <ApplicationStatusCard kycId={kycId} />;
    }

    // 4. Handle New Application
    return (
      <ApplicationForm
        account={account}
        onApplicationSubmitted={checkExistingApplication} // Pass refresh function
      />
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Customer Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Submit your KYC application and track its status
          </p>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
