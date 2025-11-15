"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { FileUploadInput } from "./FileUploadInput";

type ApplicationFormProps = {
  account: string;
  onApplicationSubmitted: () => void;
};

// Utility function to hash file
async function hashFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const fileHash = ethers.sha256(new Uint8Array(arrayBuffer));
  return fileHash;
}

export function ApplicationForm({
  account,
  onApplicationSubmitted,
}: ApplicationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    pan: "",
    ipfsAadhar: "",
    ipfsPan: "",
    aadhaarHash: "",
    panHash: "",
  });

  const [uploadingAadhar, setUploadingAadhar] = useState(false);
  const [uploadingPan, setUploadingPan] = useState(false);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);

  // --- NEW: State to track verification status ---
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAadharVerified, setIsAadharVerified] = useState(false);
  const [aadharStatusMessage, setAadharStatusMessage] = useState("");
  // --- END NEW ---

  // --- NEW: Function to verify document against your FastAPI backend ---
  async function verifyAadhaarDocument(file: File): Promise<boolean> {
    const verificationFormData = new FormData();
    verificationFormData.append("id_document", file);

    const toastId = "aadhar-verify";
    toast.loading("Verifying document... (This may take a moment)", {
      id: toastId,
    });
    setAadharStatusMessage("Verifying document..."); // For FileUploadInput

    try {
      const response = await fetch("http://127.0.0.1:8000/verify", {
        method: "POST",
        body: verificationFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Verification server error. Is the server running?"
        );
      }

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.verified === true) {
        toast.success(
          `Verification Successful! Confidence: ${result.confidence || "N/A"}`,
          { id: toastId }
        );
        setAadharStatusMessage("✓ Document verified. Now uploading to IPFS...");
        return true;
      } else {
        toast.error(
          `Verification Failed: ${result.message || "No match found."}`,
          { id: toastId, duration: 6000 }
        );
        setAadharStatusMessage(
          `Verification Failed: ${result.message || "No match found."}`
        );
        return false;
      }
    } catch (error: any) {
      console.error("Verification failed:", error);
      toast.error(
        `Verification Failed: ${error.message}. Please ensure the server is running and CORS is enabled.`,
        { id: toastId, duration: 6000 }
      );
      setAadharStatusMessage(`Verification Failed: ${error.message}`);
      return false;
    }
  }
  // --- END NEW ---

  async function handleAadharUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // --- NEW: Reset verification status on new file select ---
    setIsAadharVerified(false);
    setAadharStatusMessage("");
    setFormData((prev) => ({ ...prev, ipfsAadhar: "", aadhaarHash: "" }));
    // --- END NEW ---

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
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
    // --- MODIFIED: Set both verifying and uploading states ---
    setIsVerifying(true);
    setUploadingAadhar(true); // This keeps the input disabled

    try {
      // --- NEW: Perform backend verification FIRST ---
      const verificationSuccess = await verifyAadhaarDocument(file);
      setIsVerifying(false); // Verification step is done

      if (!verificationSuccess) {
        setAadharFile(null);
        setUploadingAadhar(false);
        // Status message is already set by verifyAadhaarDocument
        return; // <-- STOPS HERE
      }

      // If verification succeeds, mark as verified and continue
      setIsAadharVerified(true);
      // --- END NEW ---

      // --- Continue with existing logic ---
      toast.loading("Hashing document...", { id: "aadhar-upload" });
      const fileHash = await hashFile(file);

      const contract = await getContract();
      const isUsed = await contract.isAadhaarHashUsed(fileHash);
      if (isUsed) {
        toast.error("This Aadhaar document has already been uploaded.", {
          id: "aadhar-upload",
        });
        setAadharFile(null);
        setUploadingAadhar(false);
        setIsAadharVerified(false); // Reset
        setAadharStatusMessage(
          "This Aadhaar document has already been uploaded."
        );
        return;
      }

      toast.loading("Uploading Aadhaar document to IPFS...", {
        id: "aadhar-upload",
      });
      const ipfsHash = await uploadToIPFS(file);

      setFormData((prev) => ({
        ...prev,
        ipfsAadhar: ipfsHash,
        aadhaarHash: fileHash,
      }));
      toast.success("Aadhaar document uploaded successfully!", {
        id: "aadhar-upload",
      });
      setAadharStatusMessage("✓ Document verified and uploaded successfully!");
      // --- End of existing logic ---
    } catch (error: any) {
      console.error("Error uploading Aadhaar:", error);
      toast.error(error.message || "Failed to upload Aadhaar document", {
        id: "aadhar-upload",
      });
      setAadharFile(null);
      setFormData((prev) => ({ ...prev, ipfsAadhar: "", aadhaarHash: "" }));
      // --- NEW: Reset status on error ---
      setIsAadharVerified(false);
      setIsVerifying(false);
      setAadharStatusMessage(`Upload Failed: ${error.message}`);
      // --- END NEW ---
    } finally {
      // --- MODIFIED: Ensure all loading states are reset ---
      setIsVerifying(false);
      setUploadingAadhar(false);
      // --- END MODIFIED ---
    }
  }

  async function handlePanUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
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
      toast.loading("Hashing document...", { id: "pan-upload" });
      const fileHash = await hashFile(file);

      const contract = await getContract();
      const isUsed = await contract.isPanHashUsed(fileHash);
      if (isUsed) {
        toast.error("This PAN document has already been uploaded.", {
          id: "pan-upload",
        });
        setPanFile(null);
        setUploadingPan(false);
        return;
      }

      toast.loading("Uploading PAN document...", { id: "pan-upload" });
      const ipfsHash = await uploadToIPFS(file);

      setFormData((prev) => ({
        ...prev,
        ipfsPan: ipfsHash,
        panHash: fileHash,
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
      setFormData((prev) => ({ ...prev, ipfsPan: "", panHash: "" }));
    } finally {
      setUploadingPan(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !formData.ipfsAadhar ||
      !formData.ipfsPan ||
      !formData.aadhaarHash ||
      !formData.panHash
    ) {
      toast.error("Please upload both Aadhaar and PAN documents");
      return;
    }

    // --- NEW: Check for verification status ---
    if (!isAadharVerified) {
      toast.error("Aadhaar document has not been verified.");
      return;
    }
    // --- END NEW ---

    setLoading(true);
    try {
      const uniqueKycId = `KYC-${account.slice(2, 10)}-${Date.now()}`;
      const contract = await getContract(true);

      const tx = await contract.submitApplication(
        uniqueKycId,
        formData.name,
        formData.pan,
        formData.ipfsAadhar,
        formData.ipfsPan,
        formData.aadhaarHash,
        formData.panHash,
        ethers.ZeroHash
      );

      toast.loading("Submitting application...", { id: "submit" });
      await tx.wait();
      toast.success("KYC application submitted successfully!", {
        id: "submit",
      });

      onApplicationSubmitted();

      setFormData({
        name: "",
        pan: "",
        ipfsAadhar: "",
        ipfsPan: "",
        aadhaarHash: "",
        panHash: "",
      });
      setAadharFile(null);
      setPanFile(null);
      // --- NEW: Reset verification status ---
      setIsAadharVerified(false);
      setAadharStatusMessage("");
      // --- END NEW ---
    } catch (error: any) {
      console.error("Error submitting KYC:", error);
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit KYC Application</CardTitle>
        <CardDescription>
          Fill in your details and upload your documents to complete your KYC
          verification
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

          <FileUploadInput
            id="aadharFile"
            label="Aadhaar Document"
            description="Upload your Aadhaar document (JPG, PNG, or PDF, max 10MB)"
            onChange={handleAadharUpload}
            disabled={uploadingAadhar} // Pass parent loading state
            uploading={uploadingAadhar && !isVerifying} // Show spinner for IPFS
            isVerifying={isVerifying} // Show spinner for verification
            file={aadharFile}
            ipfsHash={formData.ipfsAadhar}
            statusMessage={aadharStatusMessage} // Pass status message
          />

          <FileUploadInput
            id="panFile"
            label="PAN Document"
            description="Upload your PAN card (JPG, PNG, or PDF, max 10MB)"
            onChange={handlePanUpload}
            disabled={uploadingPan}
            uploading={uploadingPan}
            file={panFile}
            ipfsHash={formData.ipfsPan}
            // No verification props for PAN card
          />

          <Button
            type="submit"
            // --- MODIFIED: Add verification check to disabled prop ---
            disabled={
              loading ||
              uploadingAadhar ||
              uploadingPan ||
              isVerifying ||
              !formData.ipfsAadhar ||
              !formData.ipfsPan ||
              !isAadharVerified // <-- MUST BE VERIFIED
            }
            // --- END MODIFIED ---
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
  );
}
