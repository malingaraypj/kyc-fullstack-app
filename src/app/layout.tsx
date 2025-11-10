import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { WalletProvider } from "@/lib/WalletProvider";
import { Toaster } from "@/components/ui/sonner";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "KYC Manager - Blockchain KYC Management System",
  description: "Secure, transparent, and decentralized KYC verification on Sepolia testnet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <WalletProvider>
          <Navigation />
          {children}
          <Toaster />
        </WalletProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}