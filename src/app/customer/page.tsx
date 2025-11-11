"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/WalletProvider";
import { getContract } from "@/lib/contract";
import { uploadToIPFS } from "@/lib/ipfs";
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
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Upload,
  File,
} from "lucide-react";
import { toast } from "sonner";
import { ethers } from "ethers";

export default function CustomerPage() {
  const { account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [hasApplication, setHasApplication] = useState(false);
  const [kycId, setKycId] = useState<string>("");

  // --- MODIFIED: Added state for hashes ---
  const [formData, setFormData] = useState({
    name: "",
    pan: "",
    ipfsAadhar: "",
    ipfsPan: "",
    aadhaarHash: "", // To store SHA-256 hash
    panHash: "", // To store SHA-256 hash
  });
  // --- END MODIFICATION ---

  const [uploadingAadhar, setUploadingAadhar] = useState(false);
  const [uploadingPan, setUploadingPan] = useState(false);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);

  useEffect(() => {
    if (account) {
      checkExistingApplication();
    }
  }, [account]);

  async function checkExistingApplication() {
    try {
      const contract = await getContract();
      const existingKycId = await contract.kycIdByApplicant(account);

      if (existingKycId && existingKycId !== "") {
        setHasApplication(true);
        setKycId(existingKycId);
      }
    } catch (error) {
      console.error("Error checking application:", error);
    }
  }

  // --- NEW: Utility function to hash file ---
  async function hashFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    // Use ethers.sha256 to hash the file content
    const fileHash = ethers.sha256(new Uint8Array(arrayBuffer));
    return fileHash;
  }
  // --- END NEW ---

  async function handleAadharUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and PDF files are allowed");
      return;
    }

    setAadharFile(file);
    setUploadingAadhar(true);

    try {
      // --- MODIFIED: Hashing and Pre-check ---
      toast.loading("Hashing document...", { id: "aadhar-upload" });
      const fileHash = await hashFile(file);

      const contract = await getContract(); // Read-only contract

      // Check if hash is already used (assumes new function in ABI)
      const isUsed = await contract.isAadhaarHashUsed(fileHash);
      if (isUsed) {
        toast.error("This Aadhaar document has already been uploaded.", {
          id: "aadhar-upload",
        });
        setAadharFile(null);
        setUploadingAadhar(false);
        return; // Stop the upload
      }
      // --- END MODIFICATION ---

      toast.loading("Uploading Aadhaar document...", { id: "aadhar-upload" });
      const ipfsHash = await uploadToIPFS(file);

      // --- MODIFIED: Store hash along with IPFS link ---
      setFormData((prev) => ({
        ...prev,
        ipfsAadhar: ipfsHash,
        aadhaarHash: fileHash, // Store the hash
      }));
      toast.success("Aadhaar document uploaded successfully!", {
        id: "aadhar-upload",
      });
    } catch (error: any) {
      console.error("Error uploading Aadhaar:", error);
      toast.error(error.message || "Failed to upload Aadhaar document", {
        id: "aadhar-upload",
      });
      setAadharFile(null);
      // --- MODIFIED: Clear hash on error ---
      setFormData((prev) => ({ ...prev, ipfsAadhar: "", aadhaarHash: "" }));
    } finally {
      setUploadingAadhar(false);
    }
  }

  async function handlePanUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and PDF files are allowed");
      return;
    }

    setPanFile(file);
    setUploadingPan(true);

    try {
      // --- MODIFIED: Hashing and Pre-check ---
      toast.loading("Hashing document...", { id: "pan-upload" });
      const fileHash = await hashFile(file);

      const contract = await getContract(); // Read-only contract

      // Check if hash is already used (assumes new function in ABI)
      const isUsed = await contract.isPanHashUsed(fileHash);
      if (isUsed) {
        toast.error("This PAN document has already been uploaded.", {
          id: "pan-upload",
        });
        setPanFile(null);
        setUploadingPan(false);
        return; // Stop the upload
      }
      // --- END MODIFICATION ---

      toast.loading("Uploading PAN document...", { id: "pan-upload" });
      const ipfsHash = await uploadToIPFS(file);

      // --- MODIFIED: Store hash along with IPFS link ---
      setFormData((prev) => ({
        ...prev,
        ipfsPan: ipfsHash,
        panHash: fileHash, // Store the hash
      }));
      toast.success("PAN document uploaded successfully!", {
        id: "pan-upload",
      });
    } catch (error: any) {
      console.error("Error uploading PAN:", error);
      toast.error(error.message || "Failed to upload PAN document", {
        id: "pan-upload",
      });
      setPanFile(null);
      // --- MODIFIED: Clear hash on error ---
      setFormData((prev) => ({ ...prev, ipfsPan: "", panHash: "" }));
    } finally {
      setUploadingPan(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    // --- MODIFIED: Check for hashes as well ---
    if (
      !formData.ipfsAadhar ||
      !formData.ipfsPan ||
      !formData.aadhaarHash ||
      !formData.panHash
    ) {
      toast.error("Please upload both Aadhaar and PAN documents");
      return;
    }
    // --- END MODIFICATION ---

    setLoading(true);
    try {
      // Generate unique KYC ID from wallet address + timestamp
      const uniqueKycId = `KYC-${account.slice(2, 10)}-${Date.now()}`;

      const contract = await getContract(true);

      // --- MODIFIED: Pass new hash arguments to the contract ---
      const tx = await contract.submitApplication(
        uniqueKycId,
        formData.name,
        formData.pan,
        formData.ipfsAadhar,
        formData.ipfsPan,
        formData.aadhaarHash, // <-- NEW
        formData.panHash, // <-- NEW
        ethers.ZeroHash // vcHash - using zero hash as placeholder
      );
      // --- END MODIFICATION ---

      toast.loading("Submitting application...", { id: "submit" });
      await tx.wait();
      toast.success("KYC application submitted successfully!", {
        id: "submit",
      });

      // Reload data
      await checkExistingApplication();

      // --- MODIFIED: Clear form, including hashes ---
      setFormData({
        name: "",
        pan: "",
        ipfsAadhar: "",
        ipfsPan: "",
        aadhaarHash: "",
        panHash: "",
      });
      // --- END MODIFICATION ---

      setAadharFile(null);
      setPanFile(null);
    } catch (error: any) {
      console.error("Error submitting KYC:", error);

      // --- MODIFIED: Improved error handling for uniqueness ---
      const errorMessage =
        error.reason || error.message || "Failed to submit application";

      if (errorMessage.includes("AadhaarHashUsed")) {
        toast.error(
          "Submission failed: This Aadhaar document is already in use.",
          { id: "submit" }
        );
      } else if (errorMessage.includes("PanHashUsed")) {
        toast.error("Submission failed: This PAN document is already in use.", {
          id: "submit",
        });
      } else {
        toast.error(errorMessage, { id: "submit" });
      }
      // --- END MODIFICATION ---
    } finally {
      setLoading(false);
    }
  }

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Customer Dashboard</CardTitle>
            <CardDescription>
              Please connect your wallet to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Connect your MetaMask wallet to submit KYC applications and view
                your status.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Customer Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Submit your KYC application and track its status
          </p>
        </div>

        {/* Current Status */}
        {hasApplication && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Your KYC Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">KYC ID:</span>
                <span className="text-muted-foreground">{kycId}</span>
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Your application has been submitted. Please check with admin
                  for approval status. You can view detailed status in the Admin
                  dashboard if you have admin access.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Application Form */}
        {!hasApplication && (
          <Card>
            <CardHeader>
              <CardTitle>Submit KYC Application</CardTitle>
              <CardDescription>
                Fill in your details and upload your documents to complete your
                KYC verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number</Label>
                  <Input
                    id="pan"
                    value={formData.pan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pan: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="ABCDE1234F"
                    pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                    title="PAN format: ABCDE1234F"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aadharFile">Aadhaar Document</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id="aadharFile"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={handleAadharUpload}
                        disabled={uploadingAadhar}
                        className="cursor-pointer"
                      />
                    </div>
                    {uploadingAadhar && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                    {formData.ipfsAadhar && !uploadingAadhar && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  {aadharFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <File className="h-4 w-4" />
                      <span>{aadharFile.name}</span>
                      <span className="text-xs">
                        ({(aadharFile.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  )}
                  {formData.ipfsAadhar && (
                    <p className="text-xs text-green-600">
                      ✓ Document uploaded successfully
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload your Aadhaar document (JPG, PNG, or PDF, max 10MB)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="panFile">PAN Document</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id="panFile"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={handlePanUpload}
                        disabled={uploadingPan}
                        className="cursor-pointer"
                      />
                    </div>
                    {uploadingPan && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                    {formData.ipfsPan && !uploadingPan && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  {panFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <File className="h-4 w-4" />
                      <span>{panFile.name}</span>
                      <span className="text-xs">
                        ({(panFile.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  )}
                  {formData.ipfsPan && (
                    <p className="text-xs text-green-600">
                      ✓ Document uploaded successfully
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload your PAN card (JPG, PNG, or PDF, max 10MB)
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={
                    loading ||
                    uploadingAadhar ||
                    uploadingPan ||
                    !formData.ipfsAadhar ||
                    !formData.ipfsPan
                  }
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
