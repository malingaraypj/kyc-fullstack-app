"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText } from "lucide-react";
import { DashboardStats } from "./DashboardStats";
import { CustomerCard } from "./CustomerCard";

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

type KycManagementTabProps = {
  customers: CustomerData[];
  processing: string | null;
  fetchError: string | null;
  onViewDoc: (cidWithPrefix: string | undefined) => void;
  onViewDetails: (customer: CustomerData) => void;
  onApprove: (customer: CustomerData) => void;
  onReject: (customer: CustomerData) => void;
  onRevoke: (customer: CustomerData) => void;
};

export function KycManagementTab({
  customers,
  processing,
  fetchError,
  onViewDoc,
  onViewDetails,
  onApprove,
  onReject,
  onRevoke,
}: KycManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>(
    []
  );

  useEffect(() => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = customers.filter(
      (c) =>
        c.kycId.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term) ||
        c.pan.toLowerCase().includes(term) ||
        c.applicant.toLowerCase().includes(term)
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const renderCustomerList = (
    customerList: CustomerData[],
    noDataText: string
  ) => {
    if (customerList.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            {searchTerm
              ? `No matching ${noDataText.toLowerCase()}`
              : noDataText}
          </CardContent>
        </Card>
      );
    }
    return customerList.map((customer) => (
      <CustomerCard
        key={customer.kycId}
        customer={customer}
        processing={processing}
        onViewDoc={onViewDoc}
        onViewDetails={onViewDetails}
        onApprove={onApprove}
        onReject={onReject}
        onRevoke={onRevoke}
      />
    ));
  };

  if (customers.length === 0 && !fetchError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 space-y-4">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <p className="font-medium">No Customer Applications</p>
              <p className="text-sm text-muted-foreground mt-1">
                Customer applications will appear here once submitted
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingCustomers = filteredCustomers.filter((c) => c.status === 0);
  const approvedCustomers = filteredCustomers.filter((c) => c.status === 1);
  const rejectedCustomers = filteredCustomers.filter((c) => c.status === 2);
  const revokedCustomers = filteredCustomers.filter((c) => c.status === 3);

  return (
    <div className="space-y-6">
      <DashboardStats customers={customers} />

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by KYC ID, Name, PAN, or Address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({pendingCustomers.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedCustomers.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedCustomers.length})
          </TabsTrigger>
          <TabsTrigger value="revoked">
            Revoked ({revokedCustomers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {renderCustomerList(pendingCustomers, "No pending applications")}
        </TabsContent>
        <TabsContent value="approved" className="space-y-4">
          {renderCustomerList(approvedCustomers, "No approved customers")}
        </TabsContent>
        <TabsContent value="rejected" className="space-y-4">
          {renderCustomerList(rejectedCustomers, "No rejected applications")}
        </TabsContent>
        <TabsContent value="revoked" className="space-y-4">
          {renderCustomerList(revokedCustomers, "No revoked customers")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
