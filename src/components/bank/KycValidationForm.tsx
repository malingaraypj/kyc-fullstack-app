// src/components/bank/KycValidationForm.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search } from "lucide-react";

interface KycValidationFormProps {
  kycId: string;
  setKycId: (val: string) => void;
  pan: string;
  setPan: (val: string) => void;
  handleValidateById: () => void;
  handleValidateByPAN: () => void;
  searchLoading: boolean;
}

export function KycValidationForm({
  kycId,
  setKycId,
  pan,
  setPan,
  handleValidateById,
  handleValidateByPAN,
  searchLoading,
}: KycValidationFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Validation</CardTitle>
        <CardDescription>
          Search by KYC ID or PAN number to verify customer status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="id" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="id">By KYC ID</TabsTrigger>
            <TabsTrigger value="pan">By PAN Number</TabsTrigger>
          </TabsList>

          <TabsContent value="id" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="kycId">KYC ID</Label>
              <div className="flex gap-2">
                <Input
                  id="kycId"
                  type="text"
                  value={kycId}
                  onChange={(e) => setKycId(e.target.value)}
                  placeholder="Enter KYC ID (e.g., KYC101)"
                />
                <Button onClick={handleValidateById} disabled={searchLoading}>
                  {searchLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pan" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="pan">PAN Number</Label>
              <div className="flex gap-2">
                <Input
                  id="pan"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="Enter PAN (e.g., ABCDE1234F)"
                />
                <Button onClick={handleValidateByPAN} disabled={searchLoading}>
                  {searchLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
