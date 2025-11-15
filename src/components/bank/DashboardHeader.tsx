// src/components/bank/DashboardHeader.tsx

import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle2 } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="flex items-center gap-3">
      <Building2 className="h-8 w-8" />
      <div className="flex-1">
        <h1 className="text-3xl font-bold">Bank Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Validate customer KYC status for banking services
        </p>
      </div>
      <Badge className="bg-green-600">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Approved Bank
      </Badge>
    </div>
  );
}
