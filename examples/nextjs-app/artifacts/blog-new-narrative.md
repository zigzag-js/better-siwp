# Why I Built better-siws: Bringing Polkadot Authentication to Better Auth

*Or: How a simple integration turned into building a plugin for the entire ecosystem*

---

Last week, I was building a new Polkadot dApp and needed authentication. Like many developers, I was tired of rolling my own auth solution every single time. When I discovered that Better Auth had just added SIWE (Sign-In with Ethereum) support, I thought, "Perfect! Polkadot has SIWS (Sign-In with Substrate) which is SIWE-compatible. This should just work!"

**Narrator: It did not, in fact, just work.**

## The Problem

Here's what I discovered after hours of debugging and diving into Better Auth's source code:

```typescript
// Better Auth's SIWE plugin validation
walletAddress: z.string().regex(/^0[xX][a-fA-F0-9]{40}$/i).length(42)
```

That regex? It's validating Ethereum addresses. Ethereum addresses look like this:
```
0x742d35Cc6634C0532925a3b844Bc9e7595f06789
```

But Polkadot addresses look like this:
```
5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
```

Not even close to matching that regex.

## The Journey

### Attempt #1: Custom Adapters

My first thought was, "No problem, Better Auth supports custom verification functions!"

```typescript
siwe({
  verifyMessage: async ({ message, signature, address }) => {
    // Just use Polkadot verification instead!
    return await verifySIWS(message, signature, address);
  }
})
```

But then I hit the next error:
```
Invalid body parameters: walletAddress must match /^0[xX][a-fA-F0-9]{40}$/i
```

The validation happens BEFORE the custom verification. Dead end.

### Attempt #2: Hacking Around It

Maybe I could transform the address? Pad it? Encode it differently? 

```typescript
// Don't do this at home
const fakeEthAddress = "0x" + Buffer.from(polkadotAddress).toString('hex').slice(0, 40);
```

This was getting ridiculous. Plus, there were deeper incompatibilities:
- Chain IDs are different (Ethereum: `1`, Polkadot: `polkadot:91b171bb158e2d3848fa23a9f1c25182`)
- Cryptography is different (secp256k1 vs sr25519)
- Message formats have subtle differences

### The Revelation

That's when it hit me: **I wasn't the only one who would face this problem.**

Every Polkadot developer who wants to use Better Auth would hit the same wall. The Polkadot ecosystem has thousands of developers building dApps, and they all need authentication.

Instead of hacking together a solution just for my app, what if I built a proper plugin that everyone could use?

## Building better-siws

I spent the next few days building `better-siws` - a Better Auth plugin specifically for Polkadot/Substrate authentication.

```bash
npm install better-siws
```

Using it is as simple as:

```typescript
import { betterAuth } from "better-auth";
import { siws } from "better-siws";

export const auth = betterAuth({
  plugins: [
    siws({
      domain: "example.com"
    })
  ]
});
```

The plugin:
- ✅ Accepts SS58 addresses (Polkadot's format)
- ✅ Verifies sr25519 signatures
- ✅ Supports Substrate chain IDs
- ✅ Works with all Polkadot wallets
- ✅ Maintains Better Auth's excellent DX

## The Technical Details

For the curious, here's how the plugin works:

1. **Custom Endpoints**: Instead of modifying SIWE, I created new endpoints that follow the same pattern but without Ethereum validation
2. **SIWS Integration**: Uses Talisman's SIWS library for message parsing and verification
3. **Better Auth Compatibility**: Implements the same API surface as SIWE, so it's a drop-in replacement

The trickiest part was understanding Better Auth's internal plugin API:

```typescript
export const siws = (options: SIWSOptions): BetterAuthPlugin => ({
  id: "siws",
  endpoints: {
    getSiweNonce: createAuthEndpoint(
      "/siwe/nonce", // Same path as SIWE for consistency
      {
        method: "POST",
        body: z.object({
          walletAddress: z.string(), // No regex validation!
        }),
      },
      async (ctx) => {
        // Implementation
      }
    ),
    // ... more endpoints
  }
});
```

## What This Means

### For Polkadot Developers

You can now use Better Auth - one of the best authentication libraries in the JavaScript ecosystem - with your Polkadot dApps. No more rolling your own auth, no more security vulnerabilities, no more session management headaches.

### For Better Auth

The plugin demonstrates Better Auth's incredible flexibility. It's not just for traditional web apps or Ethereum - it can handle any authentication method. This opens the door for other blockchain ecosystems too.

### For Web3 Adoption

One less barrier. One less reason for developers to avoid building on Polkadot. One more tool that makes Web3 development as easy as Web2.

## Try It Yourself

I've created a complete example showing everything in action:

```bash
git clone https://github.com/itsyogesh/better-siws
cd better-siws/examples/nextjs-app
npm install
npm run dev
```

Visit `http://localhost:3000` and try signing in with your Polkadot wallet!

## What's Next?

I'm working with the Better Auth team to potentially include this as an official plugin. Imagine:

```typescript
import { siws } from "better-auth/plugins/siws";
```

But even if it remains a community plugin, I'm committed to maintaining it. The Polkadot ecosystem deserves first-class developer tools.

## Lessons Learned

1. **Sometimes the best solution is building for the community** - My hack would have worked for my app, but building a plugin helps everyone

2. **Open source is powerful** - I could read Better Auth's source, understand the constraints, and build around them

3. **Web3 needs Web2 DX** - Developers shouldn't have to choose between decentralization and developer experience

4. **Ecosystems grow together** - By bridging Polkadot and Better Auth, both communities benefit

## Join Me

If you're building on Polkadot, try `better-siws` and let me know what you think. If you find bugs or have feature requests, [open an issue](https://github.com/itsyogesh/better-siws/issues).

Let's make Polkadot authentication as simple as it should be.

---

*Follow me on Twitter [@itsyogesh18](https://twitter.com/itsyogesh18) for more Web3 developer content. If you found this helpful, please share it with other Polkadot developers!*

**Resources:**
- [better-siws on GitHub](https://github.com/itsyogesh/better-siws)
- [better-siws on NPM](https://www.npmjs.com/package/better-siws)
- [Better Auth Documentation](https://better-auth.com)
- [SIWS Specification](https://github.com/TalismanSociety/siws)