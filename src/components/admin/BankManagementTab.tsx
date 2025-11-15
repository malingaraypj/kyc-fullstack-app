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
import {
  Loader2,
  CheckCircle2,
  Clock,
  Building2,
  Plus,
  Ban,
} from "lucide-react";

// Define or import these types
interface BankData {
  id: number;
  bName: string;
  addr: string;
  isApproved: boolean;
}

type BankManagementTabProps = {
  banks: BankData[];
  processing: string | null;
  onAddBankClick: () => void;
  onToggleApproval: (bankAddr: string, currentStatus: boolean) => void;
};

export function BankManagementTab({
  banks,
  processing,
  onAddBankClick,
  onToggleApproval,
}: BankManagementTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Registered Banks</CardTitle>
            <CardDescription>
              Manage bank registrations and approvals
            </CardDescription>
          </div>
          <Button onClick={onAddBankClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Bank
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {banks.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No banks registered yet
          </div>
        ) : (
          <div className="space-y-3">
            {banks.map((bank) => (
              <Card key={bank.addr}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{bank.bName}</p>
                        <p className="text-sm text-muted-foreground">
                          {bank.addr}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {bank.isApproved ? (
                        <Badge className="bg-green-600">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending Approval
                        </Badge>
                      )}
                      <Button
                        variant={bank.isApproved ? "destructive" : "default"}
                        size="sm"
                        onClick={() =>
                          onToggleApproval(bank.addr, bank.isApproved)
                        }
                        disabled={processing === bank.addr}
                      >
                        {processing === bank.addr ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : bank.isApproved ? (
                          <>
                            <Ban className="mr-2 h-4 w-4" />
                            Disapprove
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
