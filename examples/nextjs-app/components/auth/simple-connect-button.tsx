"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/contexts/wallet-context";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SimpleConnectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    accounts, 
    isConnecting, 
    isSigningIn, 
    connect, 
    signIn 
  } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      setIsOpen(true);
    } catch (error) {
      // Error is handled by the wallet context
    }
  };

  const handleSelectAccount = async (account: any) => {
    try {
      await signIn(account);
      setIsOpen(false);
    } catch (error) {
      // Error is handled by the wallet context
    }
  };

  return (
    <>
      <Button 
        onClick={handleConnect} 
        disabled={isConnecting || isSigningIn}
        variant="default" 
        size="lg"
      >
        {isConnecting || isSigningIn ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isConnecting ? "Connecting..." : "Signing in..."}
          </>
        ) : (
          "Connect Wallet"
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Account</DialogTitle>
            <DialogDescription>
              Choose an account to sign in with
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {accounts.map((account) => (
              <button
                key={account.address}
                onClick={() => handleSelectAccount(account)}
                className="w-full p-3 text-left rounded-lg border hover:bg-accent transition-colors"
                disabled={isSigningIn}
              >
                <div className="font-medium">{account.meta?.name || "Account"}</div>
                <div className="text-sm text-muted-foreground font-mono">
                  {account.address.slice(0, 8)}...{account.address.slice(-8)}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}