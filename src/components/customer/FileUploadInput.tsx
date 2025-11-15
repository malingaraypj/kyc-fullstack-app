"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, File } from "lucide-react";

type FileUploadInputProps = {
  id: string;
  label: string;
  description: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  uploading: boolean; // For IPFS upload spinner
  isVerifying?: boolean; // --- NEW: For verification spinner ---
  file: File | null;
  ipfsHash: string;
  statusMessage?: string; // --- NEW: To show messages like "Verifying..." ---
};

export function FileUploadInput({
  id,
  label,
  description,
  onChange,
  disabled,
  uploading,
  isVerifying, // --- NEW ---
  file,
  ipfsHash,
  statusMessage, // --- NEW ---
}: FileUploadInputProps) {
  const showSpinner = uploading || isVerifying;
  const showCheckmark = ipfsHash && !uploading && !isVerifying;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            id={id}
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={onChange}
            disabled={disabled || showSpinner} // --- MODIFIED ---
            className="cursor-pointer"
          />
        </div>
        {showSpinner && ( // --- MODIFIED ---
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        )}
        {showCheckmark && ( // --- MODIFIED ---
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        )}
      </div>
      {file && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <File className="h-4 w-4" />
          <span>{file.name}</span>
          <span className="text-xs">({(file.size / 1024).toFixed(2)} KB)</span>
        </div>
      )}
      {/* --- NEW: Status Message --- */}
      {statusMessage && (
        <p className="text-xs text-blue-600">{statusMessage}</p>
      )}
      {/* --- END NEW --- */}
      {ipfsHash &&
        !statusMessage && ( // Show default success if no custom message
          <p className="text-xs text-green-600">
            ✓ Document uploaded successfully
          </p>
        )}
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
