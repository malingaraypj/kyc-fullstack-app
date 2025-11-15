"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/WalletProvider";
import { getContract } from "@/lib/contract";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const { account } = useWallet();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      checkAdminStatus();
    } else {
      setLoading(false); // Not loading if no account
    }
  }, [account]);

  async function checkAdminStatus() {
    setLoading(true);
    setError(null);
    try {
      console.log("Checking admin status for account:", account);
      const contract = await getContract(true); // Use signer
      const isAdminStatus = await contract.isAdmin(account);
      console.log("Is admin:", isAdminStatus);
      setIsAdmin(isAdminStatus);
    } catch (error: any) {
      console.error("Error checking admin:", error);
      setError(error.message || "Failed to verify admin status");
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }

  // 1. Handle No Wallet
  if (!account) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              Please connect your wallet to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Connect your MetaMask wallet to access the admin dashboard.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Handle Loading State
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">
                  Verifying admin status...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 3. Handle Error State
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. Handle Access Denied
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                You do not have admin privileges. Only the contract admin can
                access this dashboard.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 5. Success: Render the main dashboard
  return <AdminDashboard />;
}
