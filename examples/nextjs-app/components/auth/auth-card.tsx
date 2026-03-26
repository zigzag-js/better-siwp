"use client";

import { useWallet } from "@/lib/contexts/wallet-context";
import { SimpleConnectButton } from "./simple-connect-button";
import { AccountInfo } from "./account-info";
import { Shield, Zap, Globe } from "lucide-react";

export function AuthCard() {
  const { isAuthenticated, user } = useWallet();

  return (
    <>
      {/* Main auth card */}
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
                Connect Your Wallet
              </h2>
              <p className="mb-8 text-zinc-500">
                Click below to authenticate with your Polkadot wallet. No
                passwords, no forms — just a signature.
              </p>
              <SimpleConnectButton />
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
            sr25519 Signatures
          </h3>
          <p className="text-sm leading-relaxed text-zinc-500">
            Cryptographic proof of wallet ownership. Private keys never leave
            your extension.
          </p>
        </div>

        <div className="group rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-6 transition-colors hover:border-[#E6007A]/30 hover:bg-zinc-900/60">
          <div className="mb-4 inline-flex rounded-lg border border-zinc-800 bg-zinc-900 p-2.5">
            <Zap className="h-5 w-5 text-[#E6007A]" />
          </div>
          <h3 className="mb-1.5 font-semibold text-zinc-200">
            One Signature
          </h3>
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
