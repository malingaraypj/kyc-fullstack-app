"use client";

import { useState } from "react";
import { getContract } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

type AddBankDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBankAdded: () => void; // Callback to refresh bank list
};

export function AddBankDialog({
  open,
  onOpenChange,
  onBankAdded,
}: AddBankDialogProps) {
  const [newBankName, setNewBankName] = useState("");
  const [newBankAddress, setNewBankAddress] = useState("");
  const [addingBank, setAddingBank] = useState(false);

  async function handleAddBank() {
    if (!newBankName.trim() || !newBankAddress.trim()) {
      toast.error("Please enter bank name and address");
      return;
    }
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
      onOpenChange(false);
      setNewBankName("");
      setNewBankAddress("");
      onBankAdded(); // Trigger refresh
    } catch (error: any) {
      console.error("Error adding bank:", error);
      toast.error(error.message || "Failed to add bank", { id: "add-bank" });
    } finally {
      setAddingBank(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
  );
}
