"use client";

import { useAuth } from "@/lib/contexts/wallet-context";
import { Button } from "@/components/ui/button";
import { Identicon } from "@/components/ui/identicon";
import { LogOut, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function AccountInfo() {
  const { user, signOut } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(user.address);
    setCopied(true);
    toast.success("Address copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Success indicator */}
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
        Authenticated
      </div>

      {/* Identicon + address */}
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full border-2 border-zinc-300 p-1 shadow-[0_0_40px_-8px_#E6007A40] dark:border-zinc-700/50">
          <Identicon address={user.address} size={72} />
        </div>

        <div className="space-y-1 text-center">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Signed in successfully
          </h2>
          <p className="text-sm text-zinc-500">
            Session active via Better-Auth
          </p>
        </div>
      </div>

      {/* Address display */}
      <div className="mx-auto max-w-sm">
        <button
          onClick={copyAddress}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-zinc-700"
        >
          <code className="truncate font-mono text-sm text-zinc-700 dark:text-zinc-300">
            {user.address}
          </code>
          {copied ? (
            <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4 shrink-0 text-zinc-600" />
          )}
        </button>
      </div>

      {/* Disconnect */}
      <Button
        variant="ghost"
        onClick={signOut}
        className="cursor-pointer gap-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-300"
      >
        <LogOut className="h-4 w-4" />
        Disconnect
      </Button>
    </div>
  );
}
