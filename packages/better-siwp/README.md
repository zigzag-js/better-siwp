# @zig-zag/better-siwp

Sign In With Polkadot (SIWP) plugin for [Better-Auth](https://better-auth.com). Add wallet-based authentication to any Polkadot application with a single plugin. Users connect their wallet, sign a message, and get a server-side session.

Built on the [SIWS standard](https://github.com/TalismanSociety/siws) by Talisman. Works with any Polkadot wallet extension (Polkadot.js, Talisman, SubWallet) and any wallet framework ([LunoKit](https://github.com/Luno-lab/LunoKit), raw extension APIs, etc.).

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage with LunoKit (Recommended)](#usage-with-lunokit-recommended)
- [Usage with @polkadot/extension-dapp](#usage-with-polkadotextension-dapp)
- [API Reference](#api-reference)
- [Configuration Options](#configuration-options)
- [How It Works](#how-it-works)
- [Examples](#examples)
- [License](#license)

## Installation

```bash
npm i @zig-zag/better-siwp
```

**Peer dependencies:**

```bash
npm i better-auth zod
```

## Quick Start

### 1. Server Plugin

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { siwp } from "@zig-zag/better-siwp";

export const auth = betterAuth({
  database: yourAdapter,
  plugins: [
    siwp({
      domain: "example.com",
    }),
  ],
});
```

### 2. Client Plugin

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/client";
import { siwpClient } from "@zig-zag/better-siwp/client";

export const authClient = createAuthClient({
  plugins: [siwpClient()],
});
```

### 3. API Route (Next.js)

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

That's it on the server side. The plugin registers two endpoints:

- `POST /api/auth/siwp/nonce` — generates a nonce for a wallet address
- `POST /api/auth/siwp/verify` — verifies a signed message and creates a session

## Usage with LunoKit (Recommended)

[LunoKit](https://github.com/Luno-lab/LunoKit) handles wallet connection and provides a `useSignMessage` hook that pairs perfectly with this plugin.

```bash
npm i @luno-kit/react @luno-kit/ui @tanstack/react-query @talismn/siws
```

### Sign-in function

```typescript
import { SiwsMessage } from "@talismn/siws";
import { authClient } from "@/lib/auth-client";

export async function signInWithPolkadot(
  address: string,
  signMessage: (params: { message: string }) => Promise<{ signature: string }>
) {
  // 1. Get a nonce from the server
  const { data } = await authClient.siwp.nonce({ walletAddress: address });

  // 2. Build a SIWS message
  const siwsMessage = new SiwsMessage({
    domain: window.location.host,
    address,
    statement: "Sign in with your Polkadot wallet",
    uri: window.location.origin,
    version: "1.0.0",
    nonce: data.nonce,
    issuedAt: Date.now(),
    expirationTime: Date.now() + 24 * 60 * 60 * 1000,
  });
  const message = siwsMessage.prepareMessage();

  // 3. Sign via LunoKit's useSignMessage hook
  const { signature } = await signMessage({ message });

  // 4. Verify with the server — session cookie is set automatically
  await authClient.siwp.verify({ message, signature, walletAddress: address });
}
```

### React component

```tsx
import { useAccount, useSignMessage } from "@luno-kit/react";
import { useConnectModal } from "@luno-kit/ui";
import { signInWithPolkadot } from "@/lib/auth/polkadot-auth-client";

function AuthButton() {
  const { account } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { open: openConnectModal } = useConnectModal();

  if (!account) {
    return <button onClick={openConnectModal}>Connect Wallet</button>;
  }

  return (
    <button onClick={() => signInWithPolkadot(account.address, signMessageAsync)}>
      Sign In
    </button>
  );
}
```

## Usage with @polkadot/extension-dapp

If you prefer to work with the Polkadot.js extension APIs directly:

```bash
npm i @polkadot/extension-dapp @talismn/siws
```

```typescript
import { web3Enable, web3Accounts, web3FromAddress } from "@polkadot/extension-dapp";
import { SiwsMessage } from "@talismn/siws";
import { authClient } from "@/lib/auth-client";

async function signIn() {
  // 1. Connect to wallet extensions
  await web3Enable("My App");
  const accounts = await web3Accounts();
  const account = accounts[0];

  // 2. Get nonce
  const { data } = await authClient.siwp.nonce({ walletAddress: account.address });

  // 3. Build and sign the message
  const siwsMessage = new SiwsMessage({
    domain: window.location.host,
    address: account.address,
    statement: "Sign in with your Polkadot wallet",
    uri: window.location.origin,
    version: "1.0.0",
    nonce: data.nonce,
    issuedAt: Date.now(),
    expirationTime: Date.now() + 24 * 60 * 60 * 1000,
  });
  const message = siwsMessage.prepareMessage();

  const injector = await web3FromAddress(account.address);
  const { signature } = await injector.signer.signRaw!({
    address: account.address,
    data: message,
    type: "bytes",
  });

  // 4. Verify — session is created server-side
  await authClient.siwp.verify({ message, signature, walletAddress: account.address });
}
```

## API Reference

### Server Exports

```typescript
import { siwp, parseMessage, verifySIWS } from "@zig-zag/better-siwp";
import type { SIWPOptions, SiwsMessage } from "@zig-zag/better-siwp";
```

| Export | Description |
|--------|-------------|
| `siwp(options)` | Better-Auth server plugin |
| `parseMessage(message)` | Parse a SIWS message string (re-exported from @talismn/siws) |
| `verifySIWS(message, signature, address)` | Verify a SIWS signature (re-exported from @talismn/siws) |
| `SIWPOptions` | Plugin configuration type |
| `SiwsMessage` | SIWS message type |

### Client Exports

```typescript
import { siwpClient } from "@zig-zag/better-siwp/client";
```

| Export | Description |
|--------|-------------|
| `siwpClient()` | Better-Auth client plugin — adds `authClient.siwp.nonce()` and `authClient.siwp.verify()` |

### Client Methods

After adding `siwpClient()` to your auth client:

```typescript
// Request a nonce (15-minute expiry, single use)
const { data, error } = await authClient.siwp.nonce({
  walletAddress: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
});
// data: { nonce: string }

// Verify a signed message and create a session
const { data, error } = await authClient.siwp.verify({
  message: "...",          // The prepared SIWS message string
  signature: "0x...",      // The wallet signature
  walletAddress: "5Grw...", // The signing address
});
// data: { token: string, success: boolean, user: { id: string, walletAddress: string } }
```

## Configuration Options

```typescript
siwp({
  // Required: your domain without protocol
  domain: "example.com",

  // Optional: custom nonce generation
  getNonce: async () => {
    return crypto.randomUUID();
  },

  // Optional: custom signature verification
  verifyMessage: async ({ message, signature, address }) => {
    // Your custom logic — return true if valid
    return true;
  },

  // Optional: extract user info from the wallet
  getUserInfo: async ({ message, address, signature }) => {
    return {
      name: "Alice",
      email: "alice@example.com",
      image: "https://example.com/avatar.png",
    };
  },

  // Optional: domain for generated email addresses
  // Default: uses the main domain (e.g., "5Grw...@example.com")
  emailDomainName: "users.example.com",
});
```

| Option | Type | Required | Default |
|--------|------|----------|---------|
| `domain` | `string` | Yes | — |
| `getNonce` | `() => Promise<string>` | No | Random alphanumeric string |
| `verifyMessage` | `(params) => Promise<boolean>` | No | `verifySIWS` from @talismn/siws |
| `getUserInfo` | `(params) => Promise<UserInfo>` | No | Name from truncated address |
| `emailDomainName` | `string` | No | Same as `domain` |

## How It Works

```
1. User clicks "Connect Wallet"
   └─ Wallet extension shows available accounts

2. User selects an account
   └─ App calls authClient.siwp.nonce({ walletAddress })
   └─ Server generates a nonce, stores it (15 min expiry)

3. App builds a SIWS message with the nonce
   └─ Using SiwsMessage from @talismn/siws

4. User signs the message in their wallet
   └─ sr25519 signature, private key never leaves the extension

5. App calls authClient.siwp.verify({ message, signature, walletAddress })
   └─ Server validates: address match, domain match, nonce match
   └─ Server verifies the cryptographic signature
   └─ Server creates or finds the user
   └─ Server creates a session and sets a cookie

6. User is authenticated
   └─ Session persists across page loads via Better-Auth
```

The nonce is deleted after verification — each signature is single-use (replay protection).

## Examples

The [GitHub repository](https://github.com/zigzag-js/better-siwp) includes two complete example apps:

| Example | Stack | Description |
|---------|-------|-------------|
| `examples/nextjs-lunokit` | LunoKit + Dedot + Next.js | **Recommended** — modern wallet connection with LunoKit hooks |
| `examples/nextjs-app` | @polkadot/extension-dapp + Next.js | Direct extension API usage |

Both examples include a polished dark-themed UI with Polkadot identicons, wallet connection, session persistence, and sign-out.

## Part of the ZigZag Ecosystem

- [`@zig-zag/chains`](https://github.com/zigzag-js/chains) — Chain registry for Polkadot SDK chains
- [`@zig-zag/better-siwp`](https://github.com/zigzag-js/better-siwp) — This package

## License

MIT - [Yogesh Kumar](https://github.com/itsyogesh)
