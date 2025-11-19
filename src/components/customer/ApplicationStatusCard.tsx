"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, FileText } from "lucide-react";
import { AdminVisibilityCard } from "./AdminVisibilityCard";

type ApplicationStatusCardProps = {
  kycId: string;
};

export function ApplicationStatusCard({ kycId }: ApplicationStatusCardProps) {
  return (
    <div className="space-y-6">
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
              Your application has been submitted. Please check with admin for
              approval status.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <AdminVisibilityCard kycId={kycId} />
    </div>
  );
}
