'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Building2, CheckCircle, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Blockchain-Based KYC Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure, transparent, and decentralized Know Your Customer verification system powered by Ethereum blockchain on Sepolia testnet
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/customer">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              A simple three-step process for secure KYC verification
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="relative">
              <div className="absolute -top-4 left-6">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <CardHeader className="pt-8">
                <div className="mb-2">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Customer Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Customers connect their wallet and submit KYC applications with their personal details, PAN, Aadhaar, and address proof to the blockchain.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="relative">
              <div className="absolute -top-4 left-6">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <CardHeader className="pt-8">
                <div className="mb-2">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Admin Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Administrators review pending applications and verify or reject them based on the submitted documents. Can also revoke approved KYCs.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="relative">
              <div className="absolute -top-4 left-6">
                <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <CardHeader className="pt-8">
                <div className="mb-2">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Bank Validation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Banks can validate customer KYC status by searching with KYC ID or PAN number to verify eligibility for banking services.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Role-Based Access */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Role</h2>
            <p className="text-muted-foreground text-lg">
              Access the dashboard that fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Customer</CardTitle>
                <CardDescription>Submit and track your KYC application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Submit KYC applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Track application status</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>View verification details</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/customer">Go to Customer Dashboard</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Admin */}
            <Card className="hover:shadow-lg transition-shadow border-primary">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Admin</CardTitle>
                <CardDescription>Manage and verify KYC applications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Review pending applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Approve or reject KYCs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Revoke verified KYCs</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/admin">Go to Admin Dashboard</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Bank */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Building2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Bank</CardTitle>
                <CardDescription>Validate customer KYC status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Search by KYC ID</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Search by PAN number</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>View verification status</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/bank">Go to Bank Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Platform</h2>
            <p className="text-muted-foreground text-lg">
              Built on blockchain for maximum security and transparency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔒 Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All data stored on Ethereum blockchain with cryptographic security
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🌐 Transparent</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Immutable records that can be audited and verified by all parties
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">⚡ Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Instant verification and validation without intermediaries
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔄 Decentralized</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  No single point of failure, running on Sepolia testnet
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">KYC Manager</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by Ethereum • Sepolia Testnet
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}