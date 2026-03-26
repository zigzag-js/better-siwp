"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/contexts/wallet-context";
import { Identicon } from "@/components/ui/identicon";
import { Loader2, Wallet } from "lucide-react";
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
    signIn,
  } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      setIsOpen(true);
    } catch {
      // Error is handled by the wallet context
    }
  };

  const handleSelectAccount = async (account: { address: string; name?: string }) => {
    try {
      await signIn(account);
      setIsOpen(false);
    } catch {
      // Error is handled by the wallet context
    }
  };

  return (
    <>
      <Button
        onClick={handleConnect}
        disabled={isConnecting || isSigningIn}
        size="lg"
        className="relative h-12 cursor-pointer rounded-xl border-0 bg-[#E6007A] px-8 text-sm font-semibold text-white shadow-[0_0_24px_-4px_#E6007A80] transition-all hover:bg-[#CC006C] hover:shadow-[0_0_32px_-2px_#E6007A99] disabled:opacity-60"
      >
        {isConnecting || isSigningIn ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isConnecting ? "Detecting wallets..." : "Signing..."}
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="gap-0 overflow-hidden border-zinc-800 bg-zinc-950 p-0 sm:max-w-md">
          <DialogHeader className="border-b border-zinc-800/60 px-6 py-5">
            <DialogTitle className="text-lg font-semibold text-white">
              Select Account
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              Choose an account to authenticate with
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto p-3">
            {accounts.map((account) => (
              <button
                key={account.address}
                onClick={() => handleSelectAccount(account)}
                className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-left transition-colors hover:bg-zinc-800/60 disabled:pointer-events-none disabled:opacity-50"
                disabled={isSigningIn}
              >
                <div className="shrink-0">
                  <Identicon address={account.address} size={40} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-zinc-100">
                    {account.name || "Account"}
                  </div>
                  <div className="truncate font-mono text-xs text-zinc-500">
                    {account.address}
                  </div>
                </div>
                {isSigningIn && (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#E6007A]" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
