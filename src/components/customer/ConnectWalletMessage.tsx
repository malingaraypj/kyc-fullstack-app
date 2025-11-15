"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ConnectWalletMessage() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Customer Dashboard</CardTitle>
        <CardDescription>
          Please connect your wallet to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertDescription>
            Connect your MetaMask wallet to submit KYC applications and view
            your status.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
