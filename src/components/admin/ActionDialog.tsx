"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

// Define or import these types
// Define or import these types
interface CustomerData {
  kycId: string;
  name: string;
  pan: string;
  applicant: string;
  status: number;
  vcHash: string;
  createdAt: bigint;
  updatedAt: bigint;
  ipfsAadhar?: string;
  ipfsPan?: string;
}

export interface ActionDialogData {
  type: "approve" | "reject" | "revoke";
  customer: CustomerData;
}

type ActionDialogProps = {
  data: ActionDialogData | null;
  processing: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (remarks: string) => void;
};

export function ActionDialog({
  data,
  processing,
  onOpenChange,
  onSubmit,
}: ActionDialogProps) {
  const [remarks, setRemarks] = useState("");

  // Reset remarks when dialog data changes
  useEffect(() => {
    if (data) {
      setRemarks("");
    }
  }, [data]);

  if (!data) return null;

  const { type, customer } = data;
  const title =
    type === "approve"
      ? "Approve KYC Application"
      : type === "reject"
        ? "Reject KYC Application"
        : "Revoke KYC";

  const description =
    type === "approve"
      ? "This will approve the KYC application."
      : type === "reject"
        ? "This will reject the KYC application."
        : "This will revoke the previously approved KYC.";

  const buttonText =
    type === "approve"
      ? "Confirm Approval"
      : type === "reject"
        ? "Confirm Rejection"
        : "Confirm Revocation";

  return (
    <Dialog open={!!data} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Customer: {customer.name}</p>
            <p className="text-sm text-muted-foreground">
              KYC ID: {customer.kycId}
            </p>
            <p className="text-sm text-muted-foreground">PAN: {customer.pan}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              placeholder={`Enter reason for ${type}...`}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(remarks)}
            disabled={processing}
            variant={type === "approve" ? "default" : "destructive"}
          >
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
