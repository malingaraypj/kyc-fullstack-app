'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { useWallet } from '@/lib/WalletProvider';
import { Shield, Wallet } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { account, isConnecting, connect, disconnect } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Shield className="h-6 w-6" />
              <span>KYC Manager</span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/customer"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/customer'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                Customer
              </Link>
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/admin'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                Admin
              </Link>
              <Link
                href="/bank"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/bank'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                Bank
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {account ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm font-medium">{formatAddress(account)}</span>
                </div>
                <Button onClick={disconnect} variant="outline" size="sm">
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={connect} disabled={isConnecting}>
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
