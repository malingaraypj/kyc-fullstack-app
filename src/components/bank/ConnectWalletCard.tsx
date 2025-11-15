// src/components/bank/ConnectWalletCard.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ConnectWalletCard() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Bank Dashboard</CardTitle>
          <CardDescription>
            Please connect your wallet to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Connect your MetaMask wallet to access the bank dashboard.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
