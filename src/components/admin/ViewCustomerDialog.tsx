"use client";

import { useState, useEffect } from "react";
import { getContract } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  FileText,
  History,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

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

interface HistoryEntry {
  remarks: string;
  status: number;
  time: bigint;
}

type ViewCustomerDialogProps = {
  customer: CustomerData | null;
  onOpenChange: (open: boolean) => void;
  onViewDoc: (cidWithPrefix: string | undefined) => void;
};

// Helper functions (can be moved to a shared utils file)
function getStatusBadge(status: number) {
  switch (status) {
    case 0:
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case 1:
      return (
        <Badge className="flex items-center gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </Badge>
      );
    case 2:
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    case 3:
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Revoked
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

function getStatusText(status: number) {
  switch (status) {
    case 0:
      return "Pending";
    case 1:
      return "Approved";
    case 2:
      return "Rejected";
    case 3:
      return "Revoked";
    default:
      return "Unknown";
  }
}

export function ViewCustomerDialog({
  customer,
  onOpenChange,
  onViewDoc,
}: ViewCustomerDialogProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (customer) {
      loadCustomerHistory(customer.kycId);
    }
  }, [customer]);

  async function loadCustomerHistory(kycId: string) {
    setLoadingHistory(true);
    try {
      const contract = await getContract();
      const count = await contract.getCustomerHistoryCount(kycId);
      const totalCount = Number(count);
      const historyPromises = [];
      for (let i = 0; i < totalCount; i++) {
        historyPromises.push(contract.getCustomerHistoryEntry(kycId, i));
      }
      const historyData = await Promise.all(historyPromises);
      setHistory(
        historyData.map((h) => ({
          remarks: h[0],
          status: Number(h[1]),
          time: h[2],
        }))
      );
    } catch (error) {
      console.error("Error loading history:", error);
      toast.error("Failed to load customer history");
    } finally {
      setLoadingHistory(false);
    }
  }

  return (
    <Dialog open={!!customer} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            Complete information and history for this KYC application
          </DialogDescription>
        </DialogHeader>

        {customer && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{customer.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(customer.status)}</div>
                </div>
                <div>
                  <p className="text-muted-foreground">KYC ID</p>
                  <p className="font-medium">{customer.kycId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">PAN Number</p>
                  <p className="font-medium">{customer.pan}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Wallet Address</p>
                  <p className="font-medium text-xs break-all">
                    {customer.applicant}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Submitted On</p>
                  <p className="font-medium">
                    {new Date(
                      Number(customer.createdAt) * 1000
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {new Date(
                      Number(customer.updatedAt) * 1000
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents */}
            {(customer.ipfsAadhar || customer.ipfsPan) && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </h3>
                <div className="flex gap-2">
                  {customer.ipfsAadhar && (
                    <Button
                      variant="outline"
                      onClick={() => onViewDoc(customer.ipfsAadhar)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Aadhaar Document
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  )}
                  {customer.ipfsPan && (
                    <Button
                      variant="outline"
                      onClick={() => onViewDoc(customer.ipfsPan)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View PAN Document
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* History */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <History className="h-4 w-4" />
                Application History
              </h3>
              {loadingHistory ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No history available
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((entry, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">
                          Status changed to: {getStatusText(entry.status)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(Number(entry.time) * 1000).toLocaleString()}
                        </div>
                      </div>
                      {entry.remarks && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Remarks:{" "}
                          </span>
                          {entry.remarks}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
