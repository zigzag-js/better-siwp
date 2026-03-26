# @zig-zag/better-siwp

Sign In With Polkadot (SIWP) plugin for [Better-Auth](https://better-auth.com). Wallet authentication for Polkadot applications — one plugin, one signature, full session management.

Uses the [SIWS standard](https://github.com/TalismanSociety/siws) by Talisman under the hood.

## Installation

```bash
npm i @zig-zag/better-siwp
```

## Server Setup

```typescript
import { betterAuth } from "better-auth";
import { siwp } from "@zig-zag/better-siwp";

export const auth = betterAuth({
  plugins: [
    siwp({ domain: "example.com" }),
  ],
});
```

## Client Setup

```typescript
import { createAuthClient } from "better-auth/client";
import { siwpClient } from "@zig-zag/better-siwp/client";

export const authClient = createAuthClient({
  plugins: [siwpClient()],
});

// Request a nonce
const { data } = await authClient.siwp.nonce({ walletAddress: "5Grw..." });

// Verify a signed message
await authClient.siwp.verify({ message, signature, walletAddress });
```

## Examples

This monorepo includes two working example apps:

| Example | Stack | Description |
|---------|-------|-------------|
| [`examples/nextjs-lunokit`](./examples/nextjs-lunokit) | LunoKit + Dedot | **Recommended** — modern Polkadot stack with LunoKit wallet connection |
| [`examples/nextjs-app`](./examples/nextjs-app) | @polkadot/extension-dapp | Legacy stack with manual extension handling |

## Development

```bash
pnpm install
pnpm build:package          # Build the plugin
pnpm dev:lunokit            # Run the LunoKit example
pnpm dev                    # Run the legacy example
pnpm test                   # Run tests (25 tests, 96% coverage)
```

## Part of the ZigZag Ecosystem

- [`@zig-zag/chains`](https://github.com/zigzag-js/chains) — Chain registry for Polkadot SDK chains
- [`@zig-zag/better-siwp`](https://github.com/zigzag-js/better-siwp) — This package

## License

MIT
