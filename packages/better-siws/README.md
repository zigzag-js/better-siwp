# better-siws

Sign-In with Substrate (SIWS) plugin for [Better Auth](https://better-auth.com) - bringing Polkadot wallet authentication to your Next.js applications.

![npm version](https://img.shields.io/npm/v/better-siws)
![license](https://img.shields.io/npm/l/better-siws)

## Features

- 🔐 **Secure Authentication** - Uses sr25519 cryptographic signatures
- 🎯 **Better Auth Integration** - Seamless integration with Better Auth's session management
- 🌐 **Multi-Chain Support** - Works with Polkadot, Kusama, and any Substrate chain
- 📱 **Multi-Wallet Support** - Compatible with Polkadot.js, Talisman, SubWallet, and more
- 🚀 **TypeScript Ready** - Fully typed for excellent DX

## Installation

```bash
npm install better-siws
```

## Quick Start

### 1. Configure Better Auth

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { siws } from "better-siws";

export const auth = betterAuth({
  database: yourDatabaseAdapter,
  plugins: [
    siws({
      domain: "example.com", // Your domain without protocol
    }),
  ],
});
```

### 2. Create the Auth Client

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { siwsClient } from "better-siws/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  plugins: [
    siwsClient(),
  ],
});
```

### 3. Add Wallet Connection UI

```typescript
// components/connect-wallet.tsx
import { web3Enable, web3Accounts } from "@polkadot/extension-dapp";
import { SiwsMessage } from "better-siws";

async function connectWallet() {
  // Enable wallet extensions
  const extensions = await web3Enable("My App");
  if (extensions.length === 0) {
    throw new Error("No wallet found");
  }
  
  // Get accounts
  const accounts = await web3Accounts();
  
  // Sign in with the first account
  const account = accounts[0];
  
  // Get nonce from Better Auth
  const { data: { nonce } } = await authClient.siwe.nonce({
    walletAddress: account.address,
  });
  
  // Create SIWS message
  const message = new SiwsMessage({
    domain: window.location.host,
    address: account.address,
    statement: "Sign in to My App",
    uri: window.location.origin,
    version: "1.0.0",
    chainId: "polkadot:91b171bb158e2d3848fa23a9f1c25182",
    nonce,
    issuedAt: new Date().toISOString(),
  });
  
  // Sign message
  const signature = await signMessage(message.prepareMessage(), account);
  
  // Verify with Better Auth
  await authClient.siwe.verify({
    message: message.prepareMessage(),
    signature,
    walletAddress: account.address,
  });
}
```

## Configuration Options

```typescript
siws({
  // Required: Your domain
  domain: "example.com",
  
  // Optional: Custom nonce generation
  getNonce: async () => {
    return crypto.randomUUID();
  },
  
  // Optional: Custom signature verification
  verifyMessage: async ({ message, signature, address }) => {
    // Your custom verification logic
    return true;
  },
  
  // Optional: Extract user info from wallet
  getUserInfo: async ({ address }) => {
    return {
      name: `${address.slice(0, 6)}...${address.slice(-4)}`,
      email: `${address}@example.com`,
    };
  },
  
  // Optional: Custom email domain
  emailDomainName: "users.example.com",
});
```

## Supported Chains

The plugin works with any Substrate-based chain. Just update the `chainId`:

```typescript
// Polkadot
chainId: "polkadot:91b171bb158e2d3848fa23a9f1c25182"

// Kusama
chainId: "kusama:b0a8d493285c2df73290dfb7e61f870f"

// Westend
chainId: "westend:e143f23803ac50e8f6f8e62695d1ce9e"
```

## Full Example

Check out the [complete example](https://github.com/itsyogesh/better-siws) showing:
- Next.js 15 App Router setup
- Wallet detection and selection UI
- Session persistence
- Protected routes

## How It Works

1. **User clicks "Connect Wallet"** - Your app requests access to wallet extensions
2. **User selects account** - The wallet shows available accounts
3. **App creates SIWS message** - Following the [SIWS standard](https://github.com/TalismanSociety/siws)
4. **User signs message** - Using their private key (never leaves the wallet)
5. **Better Auth verifies** - The signature is cryptographically verified
6. **Session created** - User is now authenticated with a session cookie

## Differences from SIWE

This plugin is specifically designed for Substrate/Polkadot:
- Uses SS58 addresses instead of Ethereum addresses
- Supports sr25519 signatures (Substrate's default)
- Compatible with Polkadot wallet extensions
- Follows the SIWS message format

## Contributing

Contributions are welcome! Please open an issue or PR on [GitHub](https://github.com/itsyogesh/better-siws).

## License

MIT © [Yogesh Kothari](https://github.com/itsyogesh)

## Acknowledgments

- [Better Auth](https://better-auth.com) for the amazing auth framework
- [Talisman](https://talisman.xyz) for creating the SIWS standard
- The Polkadot community for ongoing support