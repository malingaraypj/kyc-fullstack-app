"use client";

import { useState, useEffect } from "react";
import { getContract } from "@/lib/contract";
import { GATEWAY_URL, GATEWAY_TOKEN } from "@/lib/ipfs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { KycManagementTab } from "./KycManagementTab";
import { BankManagementTab } from "./BankManagementTab";
import { AddBankDialog } from "./AddBankDialog";
import { ActionDialog, ActionDialogData } from "./ActionDialog";
import { ViewCustomerDialog } from "./ViewCustomerDialog";

// Define shared types
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

interface BankData {
  id: number;
  bName: string;
  addr: string;
  isApproved: boolean;
}

export function AdminDashboard() {
  // Data state
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [banks, setBanks] = useState<BankData[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // UI state
  const [processing, setProcessing] = useState<string | null>(null); // For any button
  const [actionDialog, setActionDialog] = useState<ActionDialogData | null>(
    null
  );
  const [viewingCustomer, setViewingCustomer] = useState<CustomerData | null>(
    null
  );
  const [showAddBankDialog, setShowAddBankDialog] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    toast.loading("Loading dashboard data...", { id: "load-data" });
    setFetchError(null);
    try {
      await Promise.all([loadCustomers(), loadBanks()]);
      toast.success("Data loaded successfully", { id: "load-data" });
    } catch (error: any) {
      console.error("Error loading data:", error);
      setFetchError(error.message || "Failed to load dashboard data");
      toast.error("Failed to load dashboard data", { id: "load-data" });
    }
  }

  async function reloadCustomers() {
    await loadCustomers();
  }

  async function loadCustomers() {
    try {
      const contract = await getContract(true);
      const count = await contract.getAllCustomersCount();
      const totalCount = Number(count);
      if (totalCount === 0) {
        setCustomers([]);
        return;
      }
      const customerDataPromises = [];
      for (let i = 0; i < totalCount; i++) {
        customerDataPromises.push(loadCustomerAtIndex(i));
      }
      const customerData = await Promise.all(customerDataPromises);

      // Separate blocked customers for potential retry
      const validCustomers: CustomerData[] = [];
      const blockedCustomers: { index: number; data: CustomerData }[] = [];

      customerData.forEach((customer, idx) => {
        if (customer) {
          if (customer.accessBlocked) {
            blockedCustomers.push({ index: idx, data: customer });
          } else {
            validCustomers.push(customer);
          }
        }
      });

      // Retry loading blocked customers in case customer unblocked access
      if (blockedCustomers.length > 0) {
        for (const blocked of blockedCustomers) {
          try {
            const retriedCustomer = await loadCustomerAtIndex(blocked.index);
            if (retriedCustomer && !retriedCustomer.accessBlocked) {
              // Successfully loaded after retry - customer unblocked access
              validCustomers.push(retriedCustomer);
            } else {
              // Still blocked
              validCustomers.push(blocked.data);
            }
          } catch (error) {
            // Keep original blocked status
            validCustomers.push(blocked.data);
          }
        }
      }

      setCustomers(validCustomers);
    } catch (error: any) {
      console.error("Error loading customers:", error);
      toast.error("Failed to load customer applications");
      setCustomers([]);
      throw error; // Re-throw to be caught by loadData
    }
  }

  async function loadCustomerAtIndex(
    index: number
  ): Promise<CustomerData | null> {
    try {
      const contract = await getContract(true);
      const data = await contract.getCustomerAt(index);
      let ipfsAadhar = "";
      let ipfsPan = "";
      try {
        const recordsCount = await contract.getCustomerRecordsCount(data[0]);
        for (let i = 0; i < Number(recordsCount); i++) {
          const record = await contract.getCustomerRecord(data[0], i);
          if (record[0] === "aadhar") ipfsAadhar = record[1];
          else if (record[0] === "pan") ipfsPan = record[1];
        }
      } catch (err) {
        // Silently ignore record fetching errors
      }

      return {
        kycId: data[0],
        name: data[1],
        pan: data[2],
        applicant: data[3],
        status: Number(data[4]),
        vcHash: data[5],
        createdAt: data[6],
        updatedAt: data[7],
        ipfsAadhar,
        ipfsPan,
        accessBlocked: false,
      };
    } catch (error: any) {
      console.error(`Error loading customer at index ${index}:`, error);
      // Handle AdminAccessRevoked error gracefully
      if (error.message?.includes("AdminAccessRevoked")) {
        console.log(
          `Customer at index ${index} has blocked admin access`,
          error
        );
        // Return a placeholder customer indicating access is blocked
        // Use a special marker to identify blocked customers for potential retry
        return {
          kycId: `BLOCKED_${index}`,
          name: "[Access Blocked by Customer]",
          pan: "[Hidden]",
          applicant: "[Hidden]",
          status: -1,
          vcHash: "",
          createdAt: BigInt(0),
          updatedAt: BigInt(0),
          ipfsAadhar: undefined,
          ipfsPan: undefined,
          accessBlocked: true,
        };
      }
      return null;
    }
  }

  async function loadBanks() {
    try {
      const contract = await getContract(true);
      const bankIndex = await contract.bankIndex();
      const totalBanks = Number(bankIndex);
      const banksData: BankData[] = [];
      for (let i = 0; i < totalBanks; i++) {
        try {
          const bankAddr = await contract.BankList(i);
          const bankInfo = await contract.Banks(bankAddr);
          banksData.push({
            id: Number(bankInfo[0]),
            bName: bankInfo[1],
            addr: bankInfo[2],
            isApproved: bankInfo[3],
          });
        } catch (err) {
          /* Skp failed bank */
        }
      }
      setBanks(banksData);
    } catch (error: any) {
      console.error("Error loading banks:", error);
      toast.error("Failed to load bank data");
      throw error; // Re-throw to be caught by loadData
    }
  }

  // --- Handlers ---

  function handleViewDoc(cidWithPrefix: string | undefined) {
    if (!cidWithPrefix) return;
    const cid = cidWithPrefix.replace("ipfs://", "");
    const url = `${GATEWAY_URL}/ipfs/${cid}?pinataGatewayToken=${GATEWAY_TOKEN}`;
    window.open(url, "_blank");
  }

  async function handleRefreshData() {
    await loadData();
  }

  async function handleToggleBankApproval(
    bankAddr: string,
    currentStatus: boolean
  ) {
    setProcessing(bankAddr);
    try {
      const contract = await getContract(true);
      const tx = await contract.setBankApproval(bankAddr, !currentStatus);
      toast.loading("Updating bank approval...", { id: "bank-approval" });
      await tx.wait();
      toast.success("Bank approval updated!", { id: "bank-approval" });
      await loadBanks(); // Refresh bank list
    } catch (error: any) {
      toast.error(error.message || "Failed to update bank", {
        id: "bank-approval",
      });
    } finally {
      setProcessing(null);
    }
  }

  function handleAction(
    type: "approve" | "reject" | "revoke",
    customer: CustomerData
  ) {
    setActionDialog({ type, customer });
  }

  async function executeAction(remarks: string) {
    if (!actionDialog) return;
    const { type, customer } = actionDialog;
    setProcessing(customer.kycId); // Use kycId for processing state

    try {
      const contract = await getContract(true);
      let tx;
      const toastId = `action-${customer.kycId}`;
      toast.loading(`${type}ing KYC...`, { id: toastId });

      if (type === "approve") {
        const vcHash =
          customer.vcHash ||
          "0x0000000000000000000000000000000000000000000000000000000000000000";
        tx = await contract.adminApprove(
          customer.kycId,
          remarks || "Approved",
          vcHash
        );
      } else if (type === "reject") {
        tx = await contract.adminReject(customer.kycId, remarks || "Rejected");
      } else {
        // revoke
        tx = await contract.adminRevoke(customer.kycId, remarks || "Revoked");
      }

      await tx.wait();
      toast.success(`KYC ${type}d successfully!`, { id: toastId });
      setActionDialog(null);
      await loadCustomers(); // Refresh customer list
    } catch (error: any) {
      toast.error(error.message || `Failed to ${type} KYC`, {
        id: `action-${customer.kycId}`,
      });
    } finally {
      setProcessing(null);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage KYC applications and bank registrations
              </p>
            </div>
          </div>
          <Button onClick={handleRefreshData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {fetchError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customers">KYC Management</TabsTrigger>
            <TabsTrigger value="banks">Bank Management</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-6">
            <KycManagementTab
              customers={customers}
              processing={processing}
              fetchError={fetchError}
              onViewDoc={handleViewDoc}
              onViewDetails={setViewingCustomer}
              onApprove={(c) => handleAction("approve", c)}
              onReject={(c) => handleAction("reject", c)}
              onRevoke={(c) => handleAction("revoke", c)}
            />
          </TabsContent>

          <TabsContent value="banks" className="space-y-6">
            <BankManagementTab
              banks={banks}
              processing={processing}
              onAddBankClick={() => setShowAddBankDialog(true)}
              onToggleApproval={handleToggleBankApproval}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddBankDialog
        open={showAddBankDialog}
        onOpenChange={setShowAddBankDialog}
        onBankAdded={loadBanks} // Refresh banks on success
      />

      <ActionDialog
        data={actionDialog}
        processing={!!processing}
        onOpenChange={() => setActionDialog(null)}
        onSubmit={executeAction}
      />

      <ViewCustomerDialog
        customer={viewingCustomer}
        onOpenChange={() => setViewingCustomer(null)}
        onViewDoc={handleViewDoc}
      />
    </div>
  );
}
