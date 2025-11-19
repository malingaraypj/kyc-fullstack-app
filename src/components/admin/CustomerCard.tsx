"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

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
  accessBlocked?: boolean; // NEW: indicates if admin access is revoked by customer
}

type CustomerCardProps = {
  customer: CustomerData;
  processing: string | null;
  onViewDoc: (cidWithPrefix: string | undefined) => void;
  onViewDetails: (customer: CustomerData) => void;
  onApprove: (customer: CustomerData) => void;
  onReject: (customer: CustomerData) => void;
  onRevoke: (customer: CustomerData) => void;
};

// Helper function for status badges
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

export function CustomerCard({
  customer,
  processing,
  onViewDoc,
  onViewDetails,
  onApprove,
  onReject,
  onRevoke,
}: CustomerCardProps) {
  const isProcessing = processing === customer.kycId;
  const status = customer.status;

  // Handle access blocked case
  if (customer.accessBlocked) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <EyeOff className="h-5 w-5 text-red-600" />
                Customer Information Hidden
              </CardTitle>
              <CardDescription className="mt-1">
                This customer has restricted admin access to their KYC details
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-red-100 text-red-800 border-red-300"
            >
              Access Blocked
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-100">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-900">
              This customer has chosen to hide their KYC information from admin
              view. They can change this privacy setting at any time through
              their privacy controls.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{customer.name}</CardTitle>
            <CardDescription className="mt-1 space-y-1">
              <div>KYC ID: {customer.kycId}</div>
              <div className="text-xs">{customer.applicant}</div>
            </CardDescription>
          </div>
          {getStatusBadge(status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">PAN Number</p>
            <p className="font-medium">{customer.pan}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {status === 0 && "Submitted On"}
              {status === 1 && "Approved On"}
              {status === 2 && "Rejected On"}
              {status === 3 && "Revoked On"}
            </p>
            <p className="font-medium">
              {new Date(
                Number(status === 0 ? customer.createdAt : customer.updatedAt) *
                  1000
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        {(customer.ipfsAadhar || customer.ipfsPan) && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Documents:</p>
            <div className="flex gap-2">
              {customer.ipfsAadhar && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDoc(customer.ipfsAadhar)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Aadhaar
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              )}
              {customer.ipfsPan && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDoc(customer.ipfsPan)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View PAN
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {status === 0 && ( // Pending
            <>
              <Button
                onClick={() => onViewDetails(customer)}
                variant="outline"
                className="flex-1"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
              <Button
                onClick={() => onApprove(customer)}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => onReject(customer)}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Reject
              </Button>
            </>
          )}

          {status === 1 && ( // Approved
            <>
              <Button
                onClick={() => onViewDetails(customer)}
                variant="outline"
                className="flex-1"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
              <Button
                variant="destructive"
                onClick={() => onRevoke(customer)}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Revoke KYC
              </Button>
            </>
          )}

          {(status === 2 || status === 3) && ( // Rejected or Revoked
            <Button
              onClick={() => onViewDetails(customer)}
              variant="outline"
              className="w-full"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details & History
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
