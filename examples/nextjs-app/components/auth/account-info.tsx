"use client";

import { useWallet } from "@/lib/contexts/wallet-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, LogOut, Copy } from "lucide-react";
import { toast } from "sonner";

export function AccountInfo() {
  const { user, signOut } = useWallet();

  const copyAddress = () => {
    navigator.clipboard.writeText(user.address);
    toast.success("Address copied to clipboard");
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <div className="flex justify-center">
        <Shield className="h-16 w-16 text-green-500" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Authenticated Successfully!</h2>
        <p className="text-muted-foreground">
          You are now signed in with your Polkadot wallet
        </p>
      </div>
      
      <div className="bg-secondary/50 rounded-lg p-6 space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Connected Account</p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="font-mono text-sm">
              {truncateAddress(user.address)}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyAddress}
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={signOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </div>
    </>
  );
}