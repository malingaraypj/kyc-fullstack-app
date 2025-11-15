// src/components/bank/KycInfoCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function KycInfoCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About KYC Validation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          • <strong>Verified:</strong> Customer has completed KYC and is
          approved for banking services.
        </p>
        <p>
          • <strong>Not Verified / Pending:</strong> KYC application is under
          review, or was rejected.
        </p>
        <p>
          • <strong>Revoked:</strong> KYC has been revoked and customer is not
          eligible for services.
        </p>
      </CardContent>
    </Card>
  );
}
