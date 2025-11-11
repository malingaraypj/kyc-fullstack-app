"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/WalletProvider";
import { getContract, ValidationResult } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface BankInfo {
  bName: string;
  addr: string;
  isApproved: boolean;
}

// **Reminder:** Make sure the ValidationResult interface in src/lib/contract.ts
// is also updated to remove the 'email' field:
// export interface ValidationResult {
//   customer: string;
//   name: string;
//   pan: string;
//   isVerified: boolean;
//   isRevoked: boolean;
// }

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
      // No signer needed for read-only calls
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
      // --- FIX: Pass 'true' to get a signer ---
      const contract = await getContract(true);
      const data = await contract.validateKYCById(kycId);

      // --- CORRECTED MAPPING ---
      // Contract returns: [customer, name, pan, isVerified, isRevoked]
      setResult({
        customer: data[0],
        name: data[1],
        pan: data[2], // Index 2 is pan
        isVerified: data[3], // Index 3 is isVerified
        isRevoked: data[4], // Index 4 is isRevoked
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
      // --- FIX: Pass 'true' to get a signer ---
      const contract = await getContract(true);
      const data = await contract.validateKYCByPAN(pan);

      // --- CORRECTED MAPPING ---
      // Contract returns: [customer, name, pan, isVerified, isRevoked]
      setResult({
        customer: data[0],
        name: data[1],
        pan: data[2], // Index 2 is pan
        isVerified: data[3], // Index 3 is isVerified
        isRevoked: data[4], // Index 4 is isRevoked
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

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Bank Dashboard</CardTitle>
            <CardDescription>
              Please connect your wallet to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Connect your MetaMask wallet to access the bank dashboard.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isBank) {
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
                You are not registered as a bank. Only registered banks can
                access this dashboard. Please contact the system administrator
                to register your institution.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bankInfo && !bankInfo.isApproved) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Pending Approval
                </CardTitle>
                <CardDescription className="mt-1">
                  {bankInfo.bName}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Your bank registration is pending approval from the system
                administrator. You will be able to access the bank dashboard
                once your registration is approved.
              </AlertDescription>
            </Alert>

            <div className="pt-4 border-t">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Bank Name</p>
                  <p className="font-medium">{bankInfo.bName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Wallet Address
                  </p>
                  <p className="font-medium text-xs break-all">
                    {bankInfo.addr}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className="mt-1">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending Approval
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Bank Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Validate customer KYC status for banking services
            </p>
          </div>
          {bankInfo && (
            <Badge className="bg-green-600">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Approved Bank
            </Badge>
          )}
        </div>

        {bankInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bank Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Bank Name</p>
                  <p className="font-medium">{bankInfo.bName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Wallet Address</p>
                  <p className="font-medium text-xs break-all">
                    {bankInfo.addr}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>KYC Validation</CardTitle>
            <CardDescription>
              Search by KYC ID or PAN number to verify customer status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="id" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="id">By KYC ID</TabsTrigger>
                <TabsTrigger value="pan">By PAN Number</TabsTrigger>
              </TabsList>

              <TabsContent value="id" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kycId">KYC ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="kycId"
                      type="text"
                      value={kycId}
                      onChange={(e) => setKycId(e.target.value)}
                      placeholder="Enter KYC ID (e.g., KYC101)"
                    />
                    <Button
                      onClick={handleValidateById}
                      disabled={searchLoading}
                    >
                      {searchLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pan" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="pan"
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      placeholder="Enter PAN (e.g., ABCDE1234F)"
                    />
                    <Button
                      onClick={handleValidateByPAN}
                      disabled={searchLoading}
                    >
                      {searchLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Validation Result</CardTitle>
                  <CardDescription className="mt-1">
                    Customer KYC information
                  </CardDescription>
                </div>
                {result.isRevoked ? (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <XCircle className="h-3 w-3" />
                    Revoked
                  </Badge>
                ) : result.isVerified ? (
                  <Badge className="flex items-center gap-1 bg-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline">Not Verified / Pending</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{result.name}</p>
                  </div>

                  {/* --- EMAIL FIELD REMOVED --- */}

                  <div>
                    <p className="text-sm text-muted-foreground">PAN Number</p>
                    <p className="font-medium">{result.pan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Customer Wallet Address
                    </p>
                    <p className="font-medium text-xs break-all">
                      {result.customer}
                    </p>
                  </div>
                </div>

                {result.isRevoked ? (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      This customer's KYC has been revoked. They are not
                      eligible for banking services.
                    </AlertDescription>
                  </Alert>
                ) : result.isVerified ? (
                  <Alert className="border-green-600">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      This customer has verified KYC and is eligible for banking
                      services.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This customer's KYC application is pending verification or
                      has been rejected.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>About KYC Validation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • <strong>Verified:</strong> Customer has completed KYC and is
              approved for banking services.
            </p>
            <p>
              • <strong>Not Verified / Pending:</strong> KYC application is
              under review, or was rejected.
            </p>
            <p>
              • <strong>Revoked:</strong> KYC has been revoked and customer is
              not eligible for services.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
