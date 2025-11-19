"use client";

import { useState, useEffect } from "react";
import { getContract } from "@/lib/contract";
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
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

type AdminVisibilityCardProps = {
  kycId: string;
  onVisibilityChanged?: () => void; // NEW: callback when visibility is changed
};

export function AdminVisibilityCard({
  kycId,
  onVisibilityChanged,
}: AdminVisibilityCardProps) {
  const [isVisible, setIsVisible] = useState<boolean | null>(null); // null = loading state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize visibility state from contract
    loadVisibilityStatus();
  }, [kycId]);

  async function loadVisibilityStatus() {
    try {
      const contract = await getContract();

      // Call getAdminVisibility to fetch current visibility state from contract
      const isCurrentlyVisible = await contract.getAdminVisibility(kycId);
      setIsVisible(isCurrentlyVisible);
    } catch (error: any) {
      console.error("Error loading visibility status:", error);
      // If error occurs (e.g., customer not found), assume visible as default
      setIsVisible(true);
    }
  }

  async function handleToggleVisibility() {
    if (isVisible === null) return;

    setLoading(true);
    try {
      const contract = await getContract(true);
      const newVisibility = !isVisible;

      const tx = await contract.setAdminVisibility(kycId, newVisibility);

      toast.loading(
        `${newVisibility ? "Allowing" : "Blocking"} admin access...`,
        { id: "visibility-toggle" }
      );
      await tx.wait();

      // Update state after successful transaction
      setIsVisible(newVisibility);
      toast.success(
        `Admin access ${newVisibility ? "allowed" : "blocked"} successfully!`,
        { id: "visibility-toggle" }
      );

      // Notify parent component (e.g., for admin dashboard refresh)
      if (onVisibilityChanged) {
        onVisibilityChanged();
      }
    } catch (error: any) {
      console.error("Error toggling visibility:", error);

      // Parse error message for better user feedback
      const errorMsg =
        error.message || error.reason || "Failed to update admin visibility";

      if (errorMsg.includes("CustomerNotFound")) {
        toast.error(
          "Application not found. Please ensure you have submitted a KYC application.",
          { id: "visibility-toggle" }
        );
      } else if (errorMsg.includes("NotApplicant")) {
        toast.error(
          "You are not authorized to change this setting. Only the original applicant can modify visibility.",
          { id: "visibility-toggle" }
        );
      } else {
        toast.error(errorMsg, { id: "visibility-toggle" });
      }
    } finally {
      setLoading(false);
    }
  }

  if (isVisible === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Admin Privacy Control
          </CardTitle>
          <CardDescription>Loading privacy settings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Please wait while we load your privacy settings.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isVisible ? (
            <Eye className="h-5 w-5 text-blue-600" />
          ) : (
            <EyeOff className="h-5 w-5 text-red-600" />
          )}
          Admin Privacy Control
        </CardTitle>
        <CardDescription>
          Manage admin access to your KYC information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert
          className={
            isVisible
              ? "bg-blue-50 border-blue-200"
              : "bg-red-50 border-red-200"
          }
        >
          <AlertDescription>
            Your KYC information is currently{" "}
            <Badge variant={isVisible ? "default" : "destructive"}>
              {isVisible ? (
                <>
                  <Eye className="mr-1 h-3 w-3" />
                  Visible to Admins
                </>
              ) : (
                <>
                  <EyeOff className="mr-1 h-3 w-3" />
                  Hidden from Admins
                </>
              )}
            </Badge>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {isVisible
              ? "Admins can currently view all your KYC details. Click below to restrict access and hide your information."
              : "Your KYC information is hidden from admins. Click below to allow admins to view your details again."}
          </p>
        </div>

        <Button
          onClick={handleToggleVisibility}
          disabled={loading}
          variant={isVisible ? "destructive" : "default"}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : isVisible ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Hide from Admins
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Allow Admin Access
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
