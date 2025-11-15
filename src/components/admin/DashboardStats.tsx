"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// We'll define the CustomerData interface here or in a shared types file
interface CustomerData {
  status: number;
  // ... other fields not needed by this component
}

type DashboardStatsProps = {
  customers: CustomerData[];
};

export function DashboardStats({ customers }: DashboardStatsProps) {
  const pendingCount = customers.filter((c) => c.status === 0).length;
  const approvedCount = customers.filter((c) => c.status === 1).length;
  const rejectedCount = customers.filter((c) => c.status === 2).length;
  const revokedCount = customers.filter((c) => c.status === 3).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Approved</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{approvedCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Rejected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{rejectedCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Revoked</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{revokedCount}</div>
        </CardContent>
      </Card>
    </div>
  );
}
