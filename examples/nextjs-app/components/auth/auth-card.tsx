"use client";

import { Card } from "@/components/ui/card";
import { useWallet } from "@/lib/contexts/wallet-context";
import { SimpleConnectButton } from "./simple-connect-button";
import { AccountInfo } from "./account-info";
import { Shield, Zap, Globe } from "lucide-react";

export function AuthCard() {
  const { isAuthenticated, user } = useWallet();

  return (
    <>
      <Card className="p-8 md:p-12 border-primary/10 shadow-xl">
        <div className="space-y-6 max-w-2xl mx-auto text-center">
          {isAuthenticated && user ? (
            <AccountInfo />
          ) : (
            <>
              <h2 className="text-2xl font-semibold">Connect Your Wallet</h2>
              <p className="text-muted-foreground">
                Click the button below to connect your Polkadot wallet and authenticate. 
                No passwords, no sign-ups, just cryptographic proof.
              </p>
              <SimpleConnectButton />
            </>
          )}
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Card className="p-6">
          <Shield className="h-8 w-8 mb-3 text-primary" />
          <h3 className="font-semibold mb-2">Cryptographically Secure</h3>
          <p className="text-sm text-muted-foreground">
            Authentication using sr25519 signatures. Your private keys never leave your wallet.
          </p>
        </Card>
        <Card className="p-6">
          <Zap className="h-8 w-8 mb-3 text-primary" />
          <h3 className="font-semibold mb-2">Lightning Fast</h3>
          <p className="text-sm text-muted-foreground">
            Sign in with a single signature. No forms, no emails, just pure Web3 simplicity.
          </p>
        </Card>
        <Card className="p-6">
          <Globe className="h-8 w-8 mb-3 text-primary" />
          <h3 className="font-semibold mb-2">Substrate Native</h3>
          <p className="text-sm text-muted-foreground">
            Works with any Substrate-based chain. Built on the SIWS standard.
          </p>
        </Card>
      </div>
    </>
  );
}