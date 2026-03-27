# @zig-zag/better-siwp

Sign In With Polkadot (SIWP) plugin for [Better-Auth](https://better-auth.com). Add wallet-based authentication to any Polkadot application with a single plugin.

Built on the [SIWS standard](https://github.com/TalismanSociety/siws) by Talisman. Works with [LunoKit](https://github.com/Luno-lab/LunoKit), [Dedot](https://github.com/dedotdev/dedot), @polkadot/extension-dapp, or any Polkadot wallet framework.

## Installation

```bash
npm i @zig-zag/better-siwp
```

## Setup

### Server

```typescript
import { betterAuth } from "better-auth";
import { siwp } from "@zig-zag/better-siwp";

export const auth = betterAuth({
  plugins: [
    siwp({ domain: "example.com" }),
  ],
});
```

### Client

```typescript
import { createAuthClient } from "better-auth/client";
import { siwpClient } from "@zig-zag/better-siwp/client";

export const authClient = createAuthClient({
  plugins: [siwpClient()],
});
```

### Using with LunoKit

LunoKit provides wallet connection and message signing out of the box:

```typescript
import { useAccount, useSignMessage } from "@luno-kit/react";
import { useConnectModal } from "@luno-kit/ui";
import { SiwsMessage } from "@talismn/siws";

function SignInButton() {
  const { account } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { open: openConnectModal } = useConnectModal();

  const handleSignIn = async () => {
    // Get nonce from server
    const { data } = await authClient.siwp.nonce({ walletAddress: account.address });

    // Build and sign the SIWS message
    const message = new SiwsMessage({ domain: location.host, address: account.address, nonce: data.nonce, ... }).prepareMessage();
    const { signature } = await signMessageAsync({ message });

    // Verify — session cookie set automatically
    await authClient.siwp.verify({ message, signature, walletAddress: account.address });
  };

  if (!account) return <button onClick={openConnectModal}>Connect Wallet</button>;
  return <button onClick={handleSignIn}>Sign In</button>;
}
```

See the [full API reference](./packages/better-siws/README.md) for all configuration options, usage with @polkadot/extension-dapp, and detailed documentation.

## Examples

| Example | Stack | Description |
|---------|-------|-------------|
| [`examples/nextjs-lunokit`](./examples/nextjs-lunokit) | Next.js + LunoKit + Dedot | Wallet connection via LunoKit, signing via `useSignMessage` |
| [`examples/nextjs-app`](./examples/nextjs-app) | Next.js + @polkadot/extension-dapp | Direct wallet extension API usage |

Both include a polished dark-themed UI with Polkadot identicons, session persistence, and sign-out.

## Development

```bash
pnpm install
pnpm build:package          # Build the plugin
pnpm dev:lunokit            # Run the LunoKit example
pnpm dev                    # Run the extension-dapp example
pnpm test                   # Run tests (25 tests, 96% coverage)
```

## Part of the ZigZag Ecosystem

- [`@zig-zag/chains`](https://github.com/zigzag-js/chains) — Chain registry for Polkadot SDK chains
- [`@zig-zag/better-siwp`](https://github.com/zigzag-js/better-siwp) — This package

## License

MIT - [Yogesh Kumar](https://github.com/itsyogesh)
