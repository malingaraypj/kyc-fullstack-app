// src/components/bank/BankInfoCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BankInfo } from "./types";

interface BankInfoCardProps {
  bankInfo: BankInfo;
}

export function BankInfoCard({ bankInfo }: BankInfoCardProps) {
  return (
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
            <p className="font-medium text-xs break-all">{bankInfo.addr}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
