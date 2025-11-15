// src/components/bank/AccessDeniedCard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function AccessDeniedCard() {
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
              You are not registered as a bank. Only registered banks can access
              this dashboard. Please contact the system administrator to
              register your institution.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
