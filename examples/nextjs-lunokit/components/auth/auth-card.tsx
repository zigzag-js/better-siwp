"use client";

import { useAccount, useAccounts } from "@luno-kit/react";
import { useConnectModal } from "@luno-kit/ui";
import { useAuth } from "@/lib/contexts/wallet-context";
import { AccountInfo } from "./account-info";
import { Identicon } from "@/components/ui/identicon";
import { Shield, Zap, Globe, Loader2, Wallet, Pen, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function AuthCard() {
  const { account } = useAccount();
  const { accounts, selectAccount } = useAccounts();
  const { open: openConnectModal } = useConnectModal();
  const { isAuthenticated, user, isSigningIn, signIn } = useAuth();
  const isConnected = !!account;
  const [showAccounts, setShowAccounts] = useState(false);

  return (
    <>
      <div className="rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:shadow-black/20 md:p-12">
        <div className="mx-auto max-w-lg text-center">
          {isAuthenticated && user ? (
            <AccountInfo />
          ) : (
            <>
              <div className="mb-2 text-sm font-medium uppercase tracking-widest text-zinc-500">
                Try it out
              </div>
              <h2 className="mb-3 text-2xl font-semibold text-zinc-900 dark:text-white">
                {isConnected ? "Sign the Message" : "Connect Your Wallet"}
              </h2>

              {isConnected ? (
                <>
                  <p className="mb-3 text-sm text-zinc-500">
                    Prove you own this wallet to complete authentication.
                  </p>

                  {/* Account selector */}
                  <div className="relative mb-6 inline-block">
                    <button
                      onClick={() => setShowAccounts(!showAccounts)}
                      className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:border-zinc-600"
                    >
                      <Identicon address={account.address} size={22} />
                      <span className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                        {account.name || `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                      </span>
                      {accounts.length > 1 && (
                        <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${showAccounts ? "rotate-180" : ""}`} />
                      )}
                    </button>

                    {showAccounts && accounts.length > 1 && (
                      <div className="absolute left-1/2 z-10 mt-1 w-64 -translate-x-1/2 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                        {accounts.map((acc) => (
                          <button
                            key={acc.address}
                            onClick={() => {
                              selectAccount(acc);
                              setShowAccounts(false);
                            }}
                            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                              acc.address === account.address ? "bg-zinc-100 dark:bg-zinc-800" : ""
                            }`}
                          >
                            <Identicon address={acc.address} size={28} />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                {acc.name || "Account"}
                              </div>
                              <div className="truncate font-mono text-xs text-zinc-400">
                                {acc.address.slice(0, 8)}...{acc.address.slice(-6)}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                  <Button
                    onClick={() => signIn()}
                    disabled={isSigningIn}
                    size="lg"
                    className="relative h-12 cursor-pointer rounded-xl border-0 bg-[#E6007A] px-8 text-sm font-semibold text-white shadow-[0_0_24px_-4px_#E6007A80] transition-all hover:bg-[#CC006C] hover:shadow-[0_0_32px_-2px_#E6007A99] disabled:opacity-60"
                  >
                    {isSigningIn ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing...
                      </>
                    ) : (
                      <>
                        <Pen className="mr-2 h-4 w-4" />
                        Sign Message
                      </>
                    )}
                  </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-8 text-zinc-500">
                    Click below to connect your Polkadot wallet via LunoKit.
                  </p>
                  <Button
                    onClick={openConnectModal}
                    size="lg"
                    className="relative h-12 cursor-pointer rounded-xl border-0 bg-[#E6007A] px-8 text-sm font-semibold text-white shadow-[0_0_24px_-4px_#E6007A80] transition-all hover:bg-[#CC006C] hover:shadow-[0_0_32px_-2px_#E6007A99]"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Feature cards */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="group rounded-xl border border-zinc-200 bg-zinc-50 p-6 transition-colors hover:border-[#E6007A]/30 hover:bg-zinc-100 dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/60">
          <div className="mb-4 inline-flex rounded-lg border border-zinc-200 bg-zinc-100 p-2.5 dark:border-zinc-800 dark:bg-zinc-900">
            <Shield className="h-5 w-5 text-[#E6007A]" />
          </div>
          <h3 className="mb-1.5 font-semibold text-zinc-800 dark:text-zinc-200">LunoKit + Dedot</h3>
          <p className="text-sm leading-relaxed text-zinc-500">Modern Polkadot stack. Wallet connection via LunoKit, chain interaction via Dedot.</p>
        </div>
        <div className="group rounded-xl border border-zinc-200 bg-zinc-50 p-6 transition-colors hover:border-[#E6007A]/30 hover:bg-zinc-100 dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/60">
          <div className="mb-4 inline-flex rounded-lg border border-zinc-200 bg-zinc-100 p-2.5 dark:border-zinc-800 dark:bg-zinc-900">
            <Zap className="h-5 w-5 text-[#E6007A]" />
          </div>
          <h3 className="mb-1.5 font-semibold text-zinc-800 dark:text-zinc-200">One Signature</h3>
          <p className="text-sm leading-relaxed text-zinc-500">Connect, sign, authenticated. Full session management handled by Better-Auth.</p>
        </div>
        <div className="group rounded-xl border border-zinc-200 bg-zinc-50 p-6 transition-colors hover:border-[#E6007A]/30 hover:bg-zinc-100 dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/60">
          <div className="mb-4 inline-flex rounded-lg border border-zinc-200 bg-zinc-100 p-2.5 dark:border-zinc-800 dark:bg-zinc-900">
            <Globe className="h-5 w-5 text-[#E6007A]" />
          </div>
          <h3 className="mb-1.5 font-semibold text-zinc-800 dark:text-zinc-200">Any Polkadot Wallet</h3>
          <p className="text-sm leading-relaxed text-zinc-500">Polkadot.js, Talisman, SubWallet, and any compatible browser extension.</p>
        </div>
      </div>
    </>
  );
}
