"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/WalletProvider";
import { getContract } from "@/lib/contract";
import { GATEWAY_URL, GATEWAY_TOKEN } from "@/lib/ipfs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  AlertTriangle,
  Search,
  FileText,
  History,
  ExternalLink,
  Eye,
  Building2,
  Plus,
  Ban,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

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

interface BankData {
  id: number;
  bName: string;
  addr: string;
  isApproved: boolean;
}

interface HistoryEntry {
  remarks: string;
  status: number;
  time: bigint;
}

interface ActionDialogData {
  type: "approve" | "reject" | "revoke";
  customer: CustomerData;
}

export default function AdminPage() {
  const { account } = useWallet();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerData[]>(
    []
  );
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionDialog, setActionDialog] = useState<ActionDialogData | null>(
    null
  );
  const [remarks, setRemarks] = useState("");
  const [viewingCustomer, setViewingCustomer] = useState<CustomerData | null>(
    null
  );
  const [customerHistory, setCustomerHistory] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Bank management states
  const [banks, setBanks] = useState<BankData[]>([]);
  const [showAddBankDialog, setShowAddBankDialog] = useState(false);
  const [newBankName, setNewBankName] = useState("");
  const [newBankAddress, setNewBankAddress] = useState("");
  const [addingBank, setAddingBank] = useState(false);

  // --- NEW HELPER FUNCTION TO FIX URL ---
  const handleViewDoc = (cidWithPrefix: string | undefined) => {
    if (!cidWithPrefix) return; // Safety check

    // Remove the "ipfs://" prefix if it exists
    const cid = cidWithPrefix.replace("ipfs://", "");

    // Build the correct gateway URL using imported constants
    const url = `${GATEWAY_URL}/ipfs/${cid}?pinataGatewayToken=${GATEWAY_TOKEN}`;

    window.open(url, "_blank");
  };
  // --- END ---

  // Fetch data when account is available or when component mounts
  useEffect(() => {
    if (account) {
      console.log("Account detected, loading admin dashboard data...");
      checkAdminAndLoadData();
    }
  }, [account]);

  // Filter customers when search term or customers change
  useEffect(() => {
    filterCustomers();
  }, [searchTerm, customers]);

  function filterCustomers() {
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
  }

  async function checkAdminAndLoadData() {
    setLoading(true);
    setFetchError(null);

    try {
      console.log("Checking admin status for account:", account);
      const contract = await getContract(true); // Use signer for admin verification
      const isAdminStatus = await contract.isAdmin(account);
      console.log("Is admin:", isAdminStatus);

      if (isAdminStatus) {
        setIsAdmin(true);
        console.log("Loading customer and bank data...");
        await Promise.all([loadCustomers(), loadBanks()]);
        console.log("Data loading complete");
      } else {
        setIsAdmin(false);
        console.log("User is not an admin");
      }
    } catch (error: any) {
      console.error("Error checking admin:", error);
      setFetchError(error.message || "Failed to verify admin status");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomers() {
    try {
      console.log("Starting to load customers...");
      const contract = await getContract(true); // Use signer for admin-restricted reads
      const count = await contract.getAllCustomersCount();
      const totalCount = Number(count);

      console.log("Total customers in contract:", totalCount);

      if (totalCount === 0) {
        console.log("No customers found in the system");
        setCustomers([]);
        setFilteredCustomers([]);
        toast.info("No customer applications found");
        return;
      }

      console.log(`Loading ${totalCount} customers...`);
      const customerDataPromises = [];
      for (let i = 0; i < totalCount; i++) {
        customerDataPromises.push(loadCustomerAtIndex(i));
      }

      const customerData = await Promise.all(customerDataPromises);
      const validCustomers = customerData.filter(
        (c) => c !== null
      ) as CustomerData[];

      console.log("Successfully loaded customers:", validCustomers.length);
      console.log("Customer data:", validCustomers);

      setCustomers(validCustomers);
      setFilteredCustomers(validCustomers);

      if (validCustomers.length > 0) {
        toast.success(
          `Loaded ${validCustomers.length} customer application(s)`
        );
      }
    } catch (error: any) {
      console.error("Error loading customers:", error);
      setFetchError(error.message || "Failed to load customer data");
      toast.error("Failed to load customer applications");
      setCustomers([]);
      setFilteredCustomers([]);
    }
  }

  async function loadCustomerAtIndex(
    index: number
  ): Promise<CustomerData | null> {
    try {
      const contract = await getContract(true); // Use signer for admin-restricted reads
      const data = await contract.getCustomerAt(index);

      console.log(`Loading customer at index ${index}:`, {
        kycId: data[0],
        name: data[1],
        pan: data[2],
        status: Number(data[4]),
      });

      // Get IPFS hashes from records
      let ipfsAadhar = "";
      let ipfsPan = "";

      try {
        const recordsCount = await contract.getCustomerRecordsCount(data[0]);
        const totalRecords = Number(recordsCount);

        console.log(`Customer ${data[0]} has ${totalRecords} records`);

        for (let i = 0; i < totalRecords; i++) {
          const record = await contract.getCustomerRecord(data[0], i);
          const kind = record[0];
          const recordData = record[1];

          if (kind === "aadhar") {
            ipfsAadhar = recordData;
          } else if (kind === "pan") {
            ipfsPan = recordData;
          }
        }
      } catch (err) {
        console.log(`No additional records found for customer: ${data[0]}`);
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
      };
    } catch (error: any) {
      console.error(`Error loading customer at index ${index}:`, error);
      return null;
    }
  }

  async function loadBanks() {
    try {
      console.log("Loading banks...");
      const contract = await getContract(true); // Use signer for admin-restricted reads
      const bankIndex = await contract.bankIndex();
      const totalBanks = Number(bankIndex);

      console.log("Total banks:", totalBanks);

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
          console.error(`Error loading bank at index ${i}:`, err);
        }
      }

      console.log("Loaded banks:", banksData.length);
      setBanks(banksData);
    } catch (error: any) {
      console.error("Error loading banks:", error);
      toast.error("Failed to load bank data");
    }
  }

  async function handleRefreshData() {
    toast.loading("Refreshing data...", { id: "refresh" });
    await checkAdminAndLoadData();
    toast.success("Data refreshed", { id: "refresh" });
  }

  async function handleAddBank() {
    if (!newBankName.trim() || !newBankAddress.trim()) {
      toast.error("Please enter bank name and address");
      return;
    }

    // Validate Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(newBankAddress)) {
      toast.error("Invalid Ethereum address");
      return;
    }

    setAddingBank(true);
    try {
      const contract = await getContract(true);
      const tx = await contract.addBank(newBankName, newBankAddress);
      toast.loading("Adding bank...", { id: "add-bank" });
      await tx.wait();
      toast.success("Bank added successfully!", { id: "add-bank" });
      setShowAddBankDialog(false);
      setNewBankName("");
      setNewBankAddress("");
      await loadBanks();
    } catch (error: any) {
      console.error("Error adding bank:", error);
      toast.error(error.message || "Failed to add bank", { id: "add-bank" });
    } finally {
      setAddingBank(false);
    }
  }

  async function handleToggleBankApproval(
    bankAddr: string,
    currentStatus: boolean
  ) {
    setProcessing(bankAddr);
    try {
      const contract = await getContract(true);
      const tx = await contract.setBankApproval(bankAddr, !currentStatus);
      toast.loading(`${currentStatus ? "Disapproving" : "Approving"} bank...`, {
        id: "bank-approval",
      });
      await tx.wait();
      toast.success(
        `Bank ${currentStatus ? "disapproved" : "approved"} successfully!`,
        { id: "bank-approval" }
      );
      await loadBanks();
    } catch (error: any) {
      console.error("Error toggling bank approval:", error);
      toast.error(error.message || "Failed to update bank approval", {
        id: "bank-approval",
      });
    } finally {
      setProcessing(null);
    }
  }

  async function loadCustomerHistory(kycId: string) {
    setLoadingHistory(true);
    try {
      const contract = await getContract();
      const count = await contract.getCustomerHistoryCount(kycId);
      const totalCount = Number(count);

      const historyPromises = [];
      for (let i = 0; i < totalCount; i++) {
        historyPromises.push(contract.getCustomerHistoryEntry(kycId, i));
      }

      const historyData = await Promise.all(historyPromises);
      const history = historyData.map((h) => ({
        remarks: h[0],
        status: Number(h[1]),
        time: h[2],
      }));

      setCustomerHistory(history);
    } catch (error) {
      console.error("Error loading history:", error);
      toast.error("Failed to load customer history");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleAction(
    action: "approve" | "reject" | "revoke",
    customer: CustomerData
  ) {
    setActionDialog({ type: action, customer });
    setRemarks("");
  }

  async function executeAction() {
    if (!actionDialog) return;

    const { type, customer } = actionDialog;
    setProcessing(customer.kycId);

    try {
      const contract = await getContract(true);
      let tx;

      if (type === "approve") {
        const vcHash =
          customer.vcHash ||
          "0x0000000000000000000000000000000000000000000000000000000000000000";
        tx = await contract.adminApprove(
          customer.kycId,
          remarks || "Approved",
          vcHash
        );
        toast.loading("Approving KYC...", { id: "action" });
      } else if (type === "reject") {
        tx = await contract.adminReject(customer.kycId, remarks || "Rejected");
        toast.loading("Rejecting KYC...", { id: "action" });
      } else {
        tx = await contract.adminRevoke(customer.kycId, remarks || "Revoked");
        toast.loading("Revoking KYC...", { id: "action" });
      }

      await tx.wait();
      toast.success(`KYC ${type}d successfully!`, { id: "action" });
      setActionDialog(null);
      setRemarks("");
      await loadCustomers();
    } catch (error: any) {
      console.error(`Error ${type}ing KYC:`, error);
      toast.error(error.message || `Failed to ${type} KYC`, { id: "action" });
    } finally {
      setProcessing(null);
    }
  }

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

  function getStatusText(status: number) {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Approved";
      case 2:
        return "Rejected";
      case 3:
        return "Revoked";
      default:
        return "Unknown";
    }
  }

  async function handleViewDetails(customer: CustomerData) {
    setViewingCustomer(customer);
    await loadCustomerHistory(customer.kycId);
  }

  if (!account) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              Please connect your wallet to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Connect your MetaMask wallet to access the admin dashboard.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">
                  Loading admin dashboard...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                You do not have admin privileges. Only the contract admin can
                access this dashboard.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingCustomers = filteredCustomers.filter((c) => c.status === 0);
  const approvedCustomers = filteredCustomers.filter((c) => c.status === 1);
  const rejectedCustomers = filteredCustomers.filter((c) => c.status === 2);
  const revokedCustomers = filteredCustomers.filter((c) => c.status === 3);

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
            {customers.length === 0 && !fetchError ? (
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
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Pending
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {customers.filter((c) => c.status === 0).length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Approved
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {customers.filter((c) => c.status === 1).length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Rejected
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {customers.filter((c) => c.status === 2).length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Revoked
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {customers.filter((c) => c.status === 3).length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

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
                    {pendingCustomers.length === 0 ? (
                      <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">
                          {searchTerm
                            ? "No matching pending applications"
                            : "No pending applications"}
                        </CardContent>
                      </Card>
                    ) : (
                      pendingCustomers.map((customer) => (
                        <Card key={customer.kycId}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle>{customer.name}</CardTitle>
                                <CardDescription className="mt-1 space-y-1">
                                  <div>KYC ID: {customer.kycId}</div>
                                  <div className="text-xs">
                                    {customer.applicant}
                                  </div>
                                </CardDescription>
                              </div>
                              {getStatusBadge(customer.status)}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  PAN Number
                                </p>
                                <p className="font-medium">{customer.pan}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Submitted On
                                </p>
                                <p className="font-medium">
                                  {new Date(
                                    Number(customer.createdAt) * 1000
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {(customer.ipfsAadhar || customer.ipfsPan) && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">
                                  Documents:
                                </p>
                                <div className="flex gap-2">
                                  {/* --- UPDATED BUTTON --- */}
                                  {customer.ipfsAadhar && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleViewDoc(customer.ipfsAadhar)
                                      }
                                    >
                                      <FileText className="mr-2 h-4 w-4" />
                                      View Aadhaar
                                      <ExternalLink className="ml-2 h-3 w-3" />
                                    </Button>
                                  )}
                                  {/* --- UPDATED BUTTON --- */}
                                  {customer.ipfsPan && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleViewDoc(customer.ipfsPan)
                                      }
                                    >
                                      <FileText className="mr-2 h-4 w-4" />
                                      View PAN
                                      <ExternalLink className="ml-2 h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleViewDetails(customer)}
                                variant="outline"
                                className="flex-1"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Button>
                              <Button
                                onClick={() =>
                                  handleAction("approve", customer)
                                }
                                disabled={processing === customer.kycId}
                                className="flex-1"
                              >
                                {processing === customer.kycId ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                )}
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleAction("reject", customer)}
                                disabled={processing === customer.kycId}
                                className="flex-1"
                              >
                                {processing === customer.kycId ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="mr-2 h-4 w-4" />
                                )}
                                Reject
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="approved" className="space-y-4">
                    {approvedCustomers.length === 0 ? (
                      <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">
                          {searchTerm
                            ? "No matching approved customers"
                            : "No approved customers"}
                        </CardContent>
                      </Card>
                    ) : (
                      approvedCustomers.map((customer) => (
                        <Card key={customer.kycId}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle>{customer.name}</CardTitle>
                                <CardDescription className="mt-1 space-y-1">
                                  <div>KYC ID: {customer.kycId}</div>
                                  <div className="text-xs">
                                    {customer.applicant}
                                  </div>
                                </CardDescription>
                              </div>
                              {getStatusBadge(customer.status)}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  PAN Number
                                </p>
                                <p className="font-medium">{customer.pan}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Approved On
                                </p>
                                <p className="font-medium">
                                  {new Date(
                                    Number(customer.updatedAt) * 1000
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {(customer.ipfsAadhar || customer.ipfsPan) && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">
                                  Documents:
                                </p>
                                <div className="flex gap-2">
                                  {/* --- UPDATED BUTTON --- */}
                                  {customer.ipfsAadhar && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleViewDoc(customer.ipfsAadhar)
                                      }
                                    >
                                      <FileText className="mr-2 h-4 w-4" />
                                      View Aadhaar
                                      <ExternalLink className="ml-2 h-3 w-3" />
                                    </Button>
                                  )}
                                  {/* --- UPDATED BUTTON --- */}
                                  {customer.ipfsPan && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleViewDoc(customer.ipfsPan)
                                      }
                                    >
                                      <FileText className="mr-2 h-4 w-4" />
                                      View PAN
                                      <ExternalLink className="ml-2 h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleViewDetails(customer)}
                                variant="outline"
                                className="flex-1"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleAction("revoke", customer)}
                                disabled={processing === customer.kycId}
                                className="flex-1"
                              >
                                {processing === customer.kycId ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="mr-2 h-4 w-4" />
                                )}
                                Revoke KYC
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="rejected" className="space-y-4">
                    {rejectedCustomers.length === 0 ? (
                      <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">
                          {searchTerm
                            ? "No matching rejected applications"
                            : "No rejected applications"}
                        </CardContent>
                      </Card>
                    ) : (
                      rejectedCustomers.map((customer) => (
                        <Card key={customer.kycId}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle>{customer.name}</CardTitle>
                                <CardDescription className="mt-1 space-y-1">
                                  <div>KYC ID: {customer.kycId}</div>
                                  <div className="text-xs">
                                    {customer.applicant}
                                  </div>
                                </CardDescription>
                              </div>
                              {getStatusBadge(customer.status)}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  PAN Number
                                </p>
                                <p className="font-medium">{customer.pan}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Rejected On
                                </p>
                                <p className="font-medium">
                                  {new Date(
                                    Number(customer.updatedAt) * 1000
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleViewDetails(customer)}
                              variant="outline"
                              className="w-full"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details & History
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="revoked" className="space-y-4">
                    {revokedCustomers.length === 0 ? (
                      <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">
                          {searchTerm
                            ? "No matching revoked customers"
                            : "No revoked customers"}
                        </CardContent>
                      </Card>
                    ) : (
                      revokedCustomers.map((customer) => (
                        <Card key={customer.kycId}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle>{customer.name}</CardTitle>
                                <CardDescription className="mt-1 space-y-1">
                                  <div>KYC ID: {customer.kycId}</div>
                                  <div className="text-xs">
                                    {customer.applicant}
                                  </div>
                                </CardDescription>
                              </div>
                              {getStatusBadge(customer.status)}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  PAN Number
                                </p>
                                <p className="font-medium">{customer.pan}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Revoked On
                                </p>
                                <p className="font-medium">
                                  {new Date(
                                    Number(customer.updatedAt) * 1000
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleViewDetails(customer)}
                              variant="outline"
                              className="w-full"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details & History
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </TabsContent>

          <TabsContent value="banks" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registered Banks</CardTitle>
                    <CardDescription>
                      Manage bank registrations and approvals
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAddBankDialog(true)}>
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
                                variant={
                                  bank.isApproved ? "destructive" : "default"
                                }
                                size="sm"
                                onClick={() =>
                                  handleToggleBankApproval(
                                    bank.addr,
                                    bank.isApproved
                                  )
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Bank Dialog */}
      <Dialog open={showAddBankDialog} onOpenChange={setShowAddBankDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Bank</DialogTitle>
            <DialogDescription>
              Register a new bank that can validate customer KYC status
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                placeholder="e.g., State Bank of India"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAddress">Bank Wallet Address</Label>
              <Input
                id="bankAddress"
                value={newBankAddress}
                onChange={(e) => setNewBankAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddBankDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddBank} disabled={addingBank}>
              {addingBank ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Bank
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog (Approve/Reject/Revoke) */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === "approve" && "Approve KYC Application"}
              {actionDialog?.type === "reject" && "Reject KYC Application"}
              {actionDialog?.type === "revoke" && "Revoke KYC"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.type === "approve" &&
                "This will approve the KYC application and allow the customer to use their verified status."}
              {actionDialog?.type === "reject" &&
                "This will reject the KYC application. The customer can submit a new application."}
              {actionDialog?.type === "revoke" &&
                "This will revoke the previously approved KYC. This action should be used carefully."}
            </DialogDescription>
          </DialogHeader>

          {actionDialog && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">
                  Customer: {actionDialog.customer.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  KYC ID: {actionDialog.customer.kycId}
                </p>
                <p className="text-sm text-muted-foreground">
                  PAN: {actionDialog.customer.pan}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  placeholder={`Enter reason for ${actionDialog.type}...`}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={executeAction}
              disabled={!!processing}
              variant={
                actionDialog?.type === "approve" ? "default" : "destructive"
              }
            >
              {processing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm{" "}
              {actionDialog?.type === "approve"
                ? "Approval"
                : actionDialog?.type === "reject"
                  ? "Rejection"
                  : "Revocation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={!!viewingCustomer}
        onOpenChange={() => setViewingCustomer(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Complete information and history for this KYC application
            </DialogDescription>
          </DialogHeader>

          {viewingCustomer && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{viewingCustomer.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(viewingCustomer.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">KYC ID</p>
                    <p className="font-medium">{viewingCustomer.kycId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">PAN Number</p>
                    <p className="font-medium">{viewingCustomer.pan}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Wallet Address</p>
                    <p className="font-medium text-xs break-all">
                      {viewingCustomer.applicant}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted On</p>
                    <p className="font-medium">
                      {new Date(
                        Number(viewingCustomer.createdAt) * 1000
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {new Date(
                        Number(viewingCustomer.updatedAt) * 1000
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {(viewingCustomer.ipfsAadhar || viewingCustomer.ipfsPan) && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents
                  </h3>
                  {/* --- UPDATED BUTTONS --- */}
                  <div className="flex gap-2">
                    {viewingCustomer.ipfsAadhar && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleViewDoc(viewingCustomer.ipfsAadhar)
                        }
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View Aadhaar Document
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    )}
                    {viewingCustomer.ipfsPan && (
                      <Button
                        variant="outline"
                        onClick={() => handleViewDoc(viewingCustomer.ipfsPan)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View PAN Document
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {/* --- END --- */}
                </div>
              )}

              {/* History */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Application History
                </h3>
                {loadingHistory ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : customerHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No history available
                  </p>
                ) : (
                  <div className="space-y-3">
                    {customerHistory.map((entry, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">
                            Status changed to: {getStatusText(entry.status)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(
                              Number(entry.time) * 1000
                            ).toLocaleString()}
                          </div>
                        </div>
                        {entry.remarks && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Remarks:{" "}
                            </span>
                            {entry.remarks}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingCustomer(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
