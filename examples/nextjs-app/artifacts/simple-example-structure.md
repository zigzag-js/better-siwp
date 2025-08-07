# Simple Example App Structure

## Overview
A minimal Next.js app that demonstrates better-siws plugin usage. This should be as simple as possible while showing the core functionality.

## Directory Structure
```
examples/nextjs-minimal/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts      # Better Auth handler
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page with auth demo
│   └── globals.css               # Minimal styles
├── lib/
│   ├── auth.ts                   # Better Auth configuration
│   └── auth-client.ts            # Client configuration
├── components/
│   └── auth-demo.tsx             # Single component showing it all
├── .env.example                  # Environment variables
├── package.json                  # Minimal dependencies
├── README.md                     # Quick start guide
└── tsconfig.json                 # TypeScript config
```

## Key Files

### 1. lib/auth.ts
```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { siws } from "better-siws";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  plugins: [
    siws({
      domain: process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") || "localhost:3000"
    })
  ]
});
```

### 2. components/auth-demo.tsx
```typescript
"use client";

import { useState, useEffect } from "react";
import { web3Enable, web3Accounts, web3FromAddress } from "@polkadot/extension-dapp";
import { SiwsMessage } from "better-siws";

export function AuthDemo() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Check session on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        if (data.session) {
          setIsAuthenticated(true);
          setAddress(data.user?.email?.split('@')[0] || '');
        }
      });
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      // 1. Enable wallet
      const extensions = await web3Enable("Better-SIWS Demo");
      if (!extensions.length) throw new Error("No wallet found");

      // 2. Get accounts
      const accounts = await web3Accounts();
      if (!accounts.length) throw new Error("No accounts found");

      const account = accounts[0];

      // 3. Get nonce
      const nonceRes = await fetch("/api/auth/siwe/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: account.address })
      });
      const { nonce } = await nonceRes.json();

      // 4. Create and sign message
      const message = new SiwsMessage({
        domain: window.location.host,
        address: account.address,
        statement: "Sign in to Better-SIWS Demo",
        uri: window.location.origin,
        version: "1.0.0",
        chainId: "polkadot:91b171bb158e2d3848fa23a9f1c25182",
        nonce,
        issuedAt: new Date().toISOString()
      });

      const injector = await web3FromAddress(account.address);
      const signed = await injector.signer.signRaw!({
        address: account.address,
        data: message.prepareMessage(),
        type: "bytes"
      });

      // 5. Verify
      const verifyRes = await fetch("/api/auth/siwe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.prepareMessage(),
          signature: signed.signature,
          walletAddress: account.address
        })
      });

      if (verifyRes.ok) {
        setIsAuthenticated(true);
        setAddress(account.address);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    setIsAuthenticated(false);
    setAddress("");
  };

  return (
    <div className="auth-demo">
      {isAuthenticated ? (
        <div>
          <p>Signed in as: {address.slice(0, 6)}...{address.slice(-4)}</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <button onClick={handleConnect} disabled={loading}>
          {loading ? "Connecting..." : "Connect Polkadot Wallet"}
        </button>
      )}
    </div>
  );
}
```

### 3. app/page.tsx
```typescript
import { AuthDemo } from "@/components/auth-demo";

export default function Home() {
  return (
    <main>
      <h1>Better-SIWS Demo</h1>
      <p>Sign in with your Polkadot wallet using Better Auth</p>
      <AuthDemo />
    </main>
  );
}
```

### 4. README.md
```markdown
# Better-SIWS Minimal Example

This example demonstrates the simplest possible integration of better-siws with Next.js.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your database (PostgreSQL):
   ```bash
   createdb better-siws-demo
   ```

3. Copy `.env.example` to `.env.local` and update:
   ```
   DATABASE_URL="postgresql://localhost/better-siws-demo"
   BETTER_AUTH_SECRET="your-secret-here"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. Push the database schema:
   ```bash
   npx drizzle-kit push
   ```

5. Run the app:
   ```bash
   npm run dev
   ```

6. Visit http://localhost:3000 and connect your wallet!

## What This Shows

- ✅ Basic wallet connection
- ✅ SIWS message signing
- ✅ Better Auth session management
- ✅ Minimal UI (no styling libraries)
- ✅ TypeScript support

## Learn More

- [Full Documentation](https://github.com/itsyogesh/better-siws)
- [Better Auth Docs](https://better-auth.com)
- [SIWS Specification](https://github.com/TalismanSociety/siws)
```

### 5. package.json
```json
{
  "name": "better-siws-example",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "better-auth": "^1.0.0",
    "better-siws": "^0.1.0",
    "@polkadot/extension-dapp": "^0.46.0",
    "drizzle-orm": "^0.29.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "drizzle-kit": "^0.29.0",
    "typescript": "^5.0.0"
  }
}
```

## Benefits of This Example

1. **Minimal Dependencies** - Only what's absolutely necessary
2. **No UI Framework** - Shows the auth flow without distractions
3. **Complete Flow** - Connect, sign, verify, session management
4. **Copy-Paste Ready** - Developers can copy the auth logic directly
5. **Well Commented** - Each step is clearly explained

## Usage in Blog/Docs

```markdown
## Quick Start

Want to see it in action? Check out our minimal example:

\```bash
npx create-next-app my-app --example https://github.com/itsyogesh/better-siws/tree/main/examples/nextjs-minimal
cd my-app
npm install
npm run dev
\```

That's it! You now have Polkadot authentication in your Next.js app.
```