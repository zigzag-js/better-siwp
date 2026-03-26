"use client";

import { useAccount } from "@luno-kit/react";
import { useConnectModal } from "@luno-kit/ui";
import { useAuth } from "@/lib/contexts/wallet-context";
import { AccountInfo } from "./account-info";
import { Shield, Zap, Globe } from "lucide-react";
import { Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AuthCard() {
  const { account } = useAccount();
  const { open: openConnectModal } = useConnectModal();
  const { isAuthenticated, user, isSigningIn, signIn } = useAuth();
  const isConnected = !!account;

  return (
    <>
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-12">
        <div className="mx-auto max-w-lg text-center">
          {isAuthenticated && user ? (
            <AccountInfo />
          ) : (
            <>
              <div className="mb-2 text-sm font-medium uppercase tracking-widest text-zinc-500">
                Try it out
              </div>
              <h2 className="mb-3 text-2xl font-semibold text-white">
                {isConnected ? "Sign the Message" : "Connect Your Wallet"}
              </h2>
              <p className="mb-8 text-zinc-500">
                {isConnected
                  ? `Connected as ${account.address.slice(0, 6)}...${account.address.slice(-4)}. Click below to authenticate.`
                  : "Click below to connect your Polkadot wallet via LunoKit."}
              </p>

              {isConnected ? (
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
                      <Shield className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={openConnectModal}
                  size="lg"
                  className="relative h-12 cursor-pointer rounded-xl border-0 bg-[#E6007A] px-8 text-sm font-semibold text-white shadow-[0_0_24px_-4px_#E6007A80] transition-all hover:bg-[#CC006C] hover:shadow-[0_0_32px_-2px_#E6007A99]"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Feature cards */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="group rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6 transition-colors hover:border-[#E6007A]/30 hover:bg-zinc-900/60">
          <div className="mb-4 inline-flex rounded-lg border border-zinc-800 bg-zinc-900 p-2.5">
            <Shield className="h-5 w-5 text-[#E6007A]" />
          </div>
          <h3 className="mb-1.5 font-semibold text-zinc-200">
            LunoKit + Dedot
          </h3>
          <p className="text-sm leading-relaxed text-zinc-500">
            Modern Polkadot stack. Wallet connection via LunoKit, chain
            interaction via Dedot.
          </p>
        </div>
        <div className="group rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6 transition-colors hover:border-[#E6007A]/30 hover:bg-zinc-900/60">
          <div className="mb-4 inline-flex rounded-lg border border-zinc-800 bg-zinc-900 p-2.5">
            <Zap className="h-5 w-5 text-[#E6007A]" />
          </div>
          <h3 className="mb-1.5 font-semibold text-zinc-200">One Signature</h3>
          <p className="text-sm leading-relaxed text-zinc-500">
            Connect, sign, authenticated. Full session management handled by
            Better-Auth.
          </p>
        </div>
        <div className="group rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6 transition-colors hover:border-[#E6007A]/30 hover:bg-zinc-900/60">
          <div className="mb-4 inline-flex rounded-lg border border-zinc-800 bg-zinc-900 p-2.5">
            <Globe className="h-5 w-5 text-[#E6007A]" />
          </div>
          <h3 className="mb-1.5 font-semibold text-zinc-200">
            Any Polkadot Wallet
          </h3>
          <p className="text-sm leading-relaxed text-zinc-500">
            Polkadot.js, Talisman, SubWallet, and any compatible browser
            extension.
          </p>
        </div>
      </div>
    </>
  );
}
