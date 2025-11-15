// src/components/bank/PendingApprovalCard.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Building2, Clock } from "lucide-react";
import { BankInfo } from "./types";

interface PendingApprovalCardProps {
  bankInfo: BankInfo;
}

export function PendingApprovalCard({ bankInfo }: PendingApprovalCardProps) {
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
              administrator. You will be able to access the bank dashboard once
              your registration is approved.
            </AlertDescription>
          </Alert>

          <div className="pt-4 border-t">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Bank Name</p>
                <p className="font-medium">{bankInfo.bName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wallet Address</p>
                <p className="font-medium text-xs break-all">{bankInfo.addr}</p>
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
