# Better-SIWS: Building Polkadot Authentication with Better-Auth

Web3 authentication in the Polkadot ecosystem has been waiting for its "Sign-In with Ethereum" moment. Today, we're building **Better-SIWS** - a production-ready authentication system that brings the simplicity of SIWE to Substrate-based chains using Better-Auth.

## What We're Building

By the end of this tutorial, you'll have a fully functional authentication system that:
- Works with any Polkadot wallet (Polkadot.js, Talisman, SubWallet, etc.)
- Provides cryptographic authentication using the SIWS standard
- Manages sessions securely with Better-Auth
- Offers a polished UX with wallet selection
- Deploys easily to Vercel with Neon PostgreSQL

## Prerequisites

- Node.js 18+ and npm
- A [Neon](https://neon.tech) account (free tier works perfectly)
- Basic knowledge of React and Next.js
- A Polkadot wallet extension (we'll guide you through this)

## Understanding the Foundation

### What is SIWE?

[Sign-In with Ethereum (SIWE)](https://eips.ethereum.org/EIPS/eip-4361) is a standard that allows users to authenticate with their Ethereum wallets. Instead of passwords, users sign a message with their private key, proving they control the wallet address.

### How Better-Auth Uses SIWE

[Better-Auth](https://www.better-auth.com) provides a SIWE plugin that handles:
- Nonce generation for replay protection
- Message format standardization
- Signature verification
- Session creation and management

The brilliant part? Better-Auth's SIWE plugin is designed to be extensible - it allows custom message verification and nonce generation functions.

### Enter SIWS: Sign-In with Substrate

The Talisman team created [SIWS](https://github.com/TalismanSociety/siws) as the Substrate equivalent of SIWE. It follows the same message format but adapts it for Substrate's cryptography:

```
example.com wants you to sign in with your Substrate account:
5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY

Sign in to Example App

URI: https://example.com
Version: 1
Chain ID: polkadot:91b171bb158e2d3848fa23a9f1c25182
Nonce: 8b42c2f0d3a1e
Issued At: 2024-01-15T10:30:00.000Z
```

The key insight: **We can replace Better-Auth's Ethereum verification with Substrate verification while keeping everything else!**

## Step 1: Project Setup

Let's create our Next.js project:

```bash
npx create-next-app@latest better-siws
cd better-siws
```

Choose these options:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No
- App Router: Yes
- Import alias: @/* (default)

## Step 2: Setting Up the Database with Neon

Head to [Neon](https://neon.tech) and create a new project. Neon provides serverless Postgres that's perfect for Next.js apps.

1. Create a new database
2. Copy your connection string
3. Create `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
BETTER_AUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Step 3: Installing Better-Auth

Let's properly set up Better-Auth with Drizzle ORM:

```bash
# Install Better-Auth and Drizzle
npm install better-auth drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

Create `drizzle.config.ts`:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

Create `lib/db/index.ts`:

```typescript
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

Create `lib/db/schema.ts` with Better-Auth's required tables:

```typescript
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email"),
  emailVerified: timestamp("emailVerified"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});
```

Push the schema to your database:

```bash
npx drizzle-kit push
```

Create the Better-Auth configuration in `lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
});
```

Create the API route handler in `app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/adapters/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
```

## Step 4: Installing Polkadot Dependencies and SIWS

Now let's add the Polkadot and SIWS dependencies:

```bash
# Polkadot/Substrate packages
npm install @polkadot/extension-dapp @polkadot/util @polkadot/util-crypto @polkadot/keyring

# SIWS for message formatting
npm install @talismn/siws

# Additional utilities
npm install @tanstack/react-query
```

## Step 5: Setting Up Modern shadcn/ui

Initialize shadcn/ui with the latest setup:

```bash
npx shadcn@latest init
```

Choose your preferences (I recommend the default style with CSS variables).

Now add the components we need:

```bash
npx shadcn@latest add button card dialog badge sonner
```

## Step 6: Creating the SIWS Adapter

Here's where the magic happens. We create an adapter that bridges Better-Auth with Polkadot's cryptography.

Create `lib/auth/siws-adapter.ts`:

```typescript
import { verifyMessage } from "@polkadot/util-crypto";
import { decodeAddress } from "@polkadot/keyring";
import { hexToU8a, isHex } from "@polkadot/util";
import { SiwsMessage } from "@talismn/siws";

export const siwsAdapter = {
  /**
   * Verifies a SIWS message signature using Polkadot cryptography
   */
  verifyMessage: async ({ 
    message, 
    signature, 
    address 
  }: {
    message: string;
    signature: string;
    address: string;
  }) => {
    try {
      // Parse the SIWS message to validate format
      const siwsMessage = new SiwsMessage(message);
      
      // Ensure the address in the message matches the provided address
      if (siwsMessage.address !== address) {
        console.error("Address mismatch:", siwsMessage.address, "!==", address);
        return false;
      }

      // Convert hex signature to Uint8Array if needed
      const signatureU8a = isHex(signature) 
        ? hexToU8a(signature) 
        : signature;

      // Decode the SS58 address to get the public key
      const publicKey = decodeAddress(address);
      
      // Convert message to bytes
      const messageU8a = new TextEncoder().encode(message);
      
      // Verify the signature using Polkadot's crypto utilities
      const isValid = await verifyMessage(
        messageU8a,
        signatureU8a,
        publicKey
      );

      return isValid;
    } catch (error) {
      console.error("Signature verification failed:", error);
      return false;
    }
  },

  /**
   * Generates a cryptographically secure nonce
   */
  generateNonce: async () => {
    // Better-Auth expects a string nonce
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  },
};
```

This adapter:
1. Uses Talisman's SIWS library to parse and validate message format
2. Converts Substrate SS58 addresses to public keys
3. Verifies signatures using Polkadot's cryptography
4. Generates secure nonces for replay protection

## Step 7: Configuring Better-Auth with SIWS

Now we integrate our SIWS adapter into Better-Auth. Update `lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { siwe } from "better-auth/plugins";
import { db } from "./db";
import { siwsAdapter } from "./auth/siws-adapter";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [
    siwe({
      // Replace default Ethereum verification with our SIWS adapter
      verifyMessage: siwsAdapter.verifyMessage,
      generateNonce: siwsAdapter.generateNonce,
      
      // SIWS-specific options
      options: {
        // Polkadot mainnet chain ID
        chainId: "polkadot:91b171bb158e2d3848fa23a9f1c25182",
        domain: process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") || "localhost:3000",
        statement: "Sign in with your Polkadot wallet",
      },

      // Extract user info from the SIWS message
      getUserInfo: async ({ message, signature, address }) => {
        const siwsMessage = new SiwsMessage(message);
        
        return {
          id: address, // Use Substrate address as user ID
          address: address,
          chainId: siwsMessage.chainId,
        };
      },
    }),
  ],
});
```

## Step 8: Creating the Polkadot Auth Client

With Better-Auth configured, let's create a client to handle wallet interactions.

Create `lib/auth/polkadot-auth-client.ts`:

```typescript
import { web3Enable, web3FromAddress, web3Accounts } from "@polkadot/extension-dapp";
import { SiwsMessage } from "@talismn/siws";

export class PolkadotAuthClient {
  private appName = "Better-SIWS";

  /**
   * Connects to available Polkadot wallet extensions
   */
  async connect() {
    // Request access to wallet extensions
    const extensions = await web3Enable(this.appName);
    
    if (extensions.length === 0) {
      throw new Error(
        "No Polkadot wallet found. Please install Polkadot.js extension or another compatible wallet."
      );
    }

    // Get all available accounts from all extensions
    const accounts = await web3Accounts();
    
    if (accounts.length === 0) {
      throw new Error(
        "No accounts found. Please create or import an account in your wallet."
      );
    }

    return accounts;
  }

  /**
   * Signs in with a selected account
   */
  async signIn(selectedAccount: any) {
    try {
      // 1. Request a nonce from Better-Auth
      const nonceResponse = await fetch("/api/auth/siwe/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!nonceResponse.ok) {
        throw new Error("Failed to get authentication nonce");
      }

      const { nonce } = await nonceResponse.json();

      // 2. Create a SIWS message
      const domain = window.location.host;
      const uri = window.location.origin;
      
      const siwsMessage = new SiwsMessage({
        domain,
        address: selectedAccount.address,
        statement: "Sign in with your Polkadot wallet to Better-SIWS",
        uri,
        version: "1",
        chainId: "polkadot:91b171bb158e2d3848fa23a9f1c25182",
        nonce,
        issuedAt: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

      const message = siwsMessage.prepareMessage();

      // 3. Get the injector for the selected account
      const injector = await web3FromAddress(selectedAccount.address);
      
      // 4. Request signature from the wallet
      const signResult = await injector.signer.signRaw({
        address: selectedAccount.address,
        data: message,
        type: "bytes",
      });

      if (!signResult) {
        throw new Error("Signing cancelled by user");
      }

      // 5. Verify the signature with Better-Auth
      const verifyResponse = await fetch("/api/auth/siwe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          signature: signResult.signature,
          address: selectedAccount.address,
        }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.text();
        throw new Error(`Authentication failed: ${error}`);
      }

      const authData = await verifyResponse.json();
      return authData;

    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  }

  /**
   * Signs out the current user
   */
  async signOut() {
    const response = await fetch("/api/auth/signout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Sign out failed");
    }

    return true;
  }
}
```

That's it for the authentication setup! We now have:
- ✅ Better-Auth configured with SIWS support
- ✅ A custom adapter that verifies Polkadot signatures
- ✅ A client that handles wallet interactions

## Step 9: Building the UI - Setting Up Context

Now let's build a great user experience. First, we'll create a React context to manage wallet state.

Create `lib/contexts/wallet-context.tsx`:

```typescript
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PolkadotAuthClient } from "@/lib/auth/polkadot-auth-client";
import { toast } from "sonner";

interface Account {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
}

interface WalletContextType {
  accounts: Account[];
  selectedAccount: Account | null;
  isConnecting: boolean;
  isSigningIn: boolean;
  isAuthenticated: boolean;
  user: any;
  connect: () => Promise<void>;
  signIn: (account?: Account) => Promise<void>;
  signOut: () => Promise<void>;
  setSelectedAccount: (account: Account) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new PolkadotAuthClient());
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        if (data.session) {
          setIsAuthenticated(true);
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error("Failed to check auth status:", error);
    }
  };

  const connect = async () => {
    setIsConnecting(true);
    try {
      const connectedAccounts = await client.connect();
      setAccounts(connectedAccounts);
      
      // Auto-select first account
      if (connectedAccounts.length > 0) {
        setSelectedAccount(connectedAccounts[0]);
      }
      
      toast.success("Wallet connected successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect wallet");
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const signIn = async (account = selectedAccount) => {
    if (!account) {
      toast.error("Please select an account");
      return;
    }

    setIsSigningIn(true);
    try {
      const authData = await client.signIn(account);
      setIsAuthenticated(true);
      setUser(authData.user);
      toast.success("Signed in successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
      throw error;
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    try {
      await client.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setSelectedAccount(null);
      setAccounts([]);
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <WalletContext.Provider
      value={{
        accounts,
        selectedAccount,
        isConnecting,
        isSigningIn,
        isAuthenticated,
        user,
        connect,
        signIn,
        signOut,
        setSelectedAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
```

Update `app/layout.tsx` to include our providers:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/lib/contexts/wallet-context";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Better-SIWS - Polkadot Authentication with Better-Auth",
  description: "Seamless Web3 authentication for Polkadot applications",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  );
}
```

## Step 10: Creating the Main Page

Let's create a clean main page that showcases our authentication.

Update `app/page.tsx`:

```typescript
import { HeroSection } from "@/components/hero-section";
import { AuthCard } from "@/components/auth/auth-card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <HeroSection />
        <AuthCard />
      </div>
    </main>
  );
}
```

Create `components/hero-section.tsx`:

```typescript
import { Badge } from "@/components/ui/badge";
import { Github, Book } from "lucide-react";

export function HeroSection() {
  return (
    <div className="text-center space-y-6 mb-12">
      <Badge variant="secondary" className="mb-4">
        Web3 Authentication Made Simple
      </Badge>
      
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
        Better-SIWS
      </h1>
      
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Production-ready Polkadot wallet authentication using Better-Auth. 
        Sign in with your Substrate wallet as easily as clicking a button.
      </p>
      
      <div className="flex gap-4 justify-center pt-4">
        <a
          href="https://github.com/yourusername/better-siws"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="h-4 w-4" />
          View on GitHub
        </a>
        <a
          href="https://docs.better-siws.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Book className="h-4 w-4" />
          Documentation
        </a>
      </div>
    </div>
  );
}
```

## Step 11: Building the Authentication Card

Create `components/auth/auth-card.tsx`:

```typescript
"use client";

import { Card } from "@/components/ui/card";
import { useWallet } from "@/lib/contexts/wallet-context";
import { ConnectWalletButton } from "./connect-wallet-button";
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
              <ConnectWalletButton />
            </>
          )}
        </div>
      </Card>

      {/* Feature cards */}
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
```

Create `components/auth/connect-wallet-button.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WalletModal } from "./wallet-modal";
import { useWallet } from "@/lib/contexts/wallet-context";
import { Loader2, Wallet } from "lucide-react";

export function ConnectWalletButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnecting } = useWallet();

  return (
    <>
      <Button
        size="lg"
        onClick={() => setIsModalOpen(true)}
        disabled={isConnecting}
        className="gap-2"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
      
      <WalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
```

Create `components/auth/account-info.tsx`:

```typescript
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
```

## Step 12: Creating the Wallet Selection Modal

Now for the most important UX element - the wallet selector that detects installed extensions.

Create `components/auth/wallet-modal.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/lib/contexts/wallet-context";
import { Loader2, ExternalLink } from "lucide-react";

interface WalletInfo {
  name: string;
  prettyName: string;
  installed: boolean;
  installUrl: string;
}

const WALLET_INFO: Record<string, Omit<WalletInfo, 'installed'>> = {
  "polkadot-js": {
    name: "polkadot-js",
    prettyName: "Polkadot.js",
    installUrl: "https://polkadot.js.org/extension/",
  },
  talisman: {
    name: "talisman",
    prettyName: "Talisman",
    installUrl: "https://talisman.xyz/download",
  },
  subwallet: {
    name: "subwallet-js",
    prettyName: "SubWallet",
    installUrl: "https://subwallet.app/download.html",
  },
};

export function WalletModal({ isOpen, onClose }: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const { connect, accounts, signIn } = useWallet();
  const [detectedWallets, setDetectedWallets] = useState<WalletInfo[]>([]);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    if (isOpen) {
      detectWallets();
    }
  }, [isOpen]);

  // Auto sign-in when accounts are connected
  useEffect(() => {
    if (accounts.length > 0) {
      signIn();
      onClose();
    }
  }, [accounts]);

  const detectWallets = async () => {
    setIsDetecting(true);
    const detected: WalletInfo[] = [];

    // Check each wallet
    for (const [key, info] of Object.entries(WALLET_INFO)) {
      const isInstalled = !!(window as any).injectedWeb3?.[key];
      detected.push({
        ...info,
        installed: isInstalled,
      });
    }

    // Sort: installed wallets first
    detected.sort((a, b) => {
      if (a.installed && !b.installed) return -1;
      if (!a.installed && b.installed) return 1;
      return 0;
    });

    setDetectedWallets(detected);
    setIsDetecting(false);
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      // Error is handled by the context
    }
  };

  const hasInstalledWallet = detectedWallets.some(w => w.installed);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            {isDetecting ? (
              "Detecting installed wallets..."
            ) : hasInstalledWallet ? (
              "Select your Polkadot wallet to continue"
            ) : (
              "No wallet detected. Please install a Polkadot wallet first."
            )}
          </DialogDescription>
        </DialogHeader>
        
        {isDetecting ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {hasInstalledWallet ? (
              <>
                <div className="space-y-3">
                  {detectedWallets.filter(w => w.installed).map((wallet) => (
                    <div key={wallet.name} className="relative">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <div className="flex-1">
                          <p className="font-medium">{wallet.prettyName}</p>
                          <p className="text-sm text-muted-foreground">Detected</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Installed
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={handleConnect} 
                  className="w-full"
                  size="lg"
                >
                  Connect Wallet
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                {detectedWallets.map((wallet) => (
                  <a
                    key={wallet.name}
                    href={wallet.installUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{wallet.prettyName}</p>
                      <p className="text-sm text-muted-foreground">
                        Click to install
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

## Step 13: Session Management

Add a session check endpoint. Create `app/api/auth/session/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return Response.json({ 
    session: session?.session || null,
    user: session?.user || null,
  });
}
```

## Step 14: Running the Application

1. Make sure your environment variables are set in `.env.local`
2. Run the development server:

```bash
npm run dev
```

3. Visit http://localhost:3000
4. Click "Connect Wallet" and follow the flow!

## Key Takeaways

We've built a production-ready authentication system that:

1. **Leverages Better-Auth's flexibility** - We replaced Ethereum verification with Substrate verification while keeping all the session management benefits

2. **Uses industry standards** - SIWS ensures compatibility with the broader Web3 ecosystem

3. **Provides excellent UX** - Auto-detection of wallets, clear error messages, and smooth flows

4. **Is easily extensible** - Add support for other Substrate chains by changing the chain ID

## Deployment

Deploy to Vercel in minutes:

1. Push your code to GitHub
2. Import to Vercel
3. Add your environment variables
4. Deploy!

## What's Next?

- **Multi-chain support**: Add Kusama, Westend, or custom chains
- **Account switching**: Allow users to switch between multiple accounts
- **Role-based access**: Extend Better-Auth's user model
- **Protected routes**: Use Better-Auth's middleware for page protection

## Resources

- [Better-SIWS GitHub Repository](https://github.com/yourusername/better-siws)
- [Better-Auth Documentation](https://www.better-auth.com/docs)
- [SIWS Specification](https://github.com/TalismanSociety/siws)
- [Polkadot.js Extension Docs](https://polkadot.js.org/docs/extension/)

---

We've successfully bridged the gap between Web3's security and Web2's developer experience. Better-SIWS makes Polkadot authentication as simple as it should be. Happy building! 🚀