// src/components/bank/ValidationResultCard.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { ValidationResult } from "./types";

interface ValidationResultCardProps {
  result: ValidationResult;
}

export function ValidationResultCard({ result }: ValidationResultCardProps) {
  return (
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
            <Badge variant="destructive" className="flex items-center gap-1">
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
            <div>
              <p className="text-sm text-muted-foreground">PAN Number</p>
              <p className="font-medium">{result.pan}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Customer Wallet Address
              </p>
              <p className="font-medium text-xs break-all">{result.customer}</p>
            </div>
          </div>

          {result.isRevoked ? (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                This customer's KYC has been revoked. They are not eligible for
                banking services.
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
                This customer's KYC application is pending verification or has
                been rejected.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
