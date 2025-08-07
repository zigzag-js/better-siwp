# better-siws

Sign-In with Substrate (SIWS) plugin for Better Auth - bringing Polkadot wallet authentication to the JavaScript ecosystem.

## 📦 Packages

This monorepo contains:

- **[`better-siws`](./packages/better-siws)** - The npm package for Better Auth SIWS plugin
- **[Example App](./examples/nextjs-app)** - Full Next.js example implementation

## 🚀 Quick Start

### Using the Plugin

```bash
npm install better-siws
```

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

### Development Setup

This project uses pnpm workspaces:

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build:package

# Run the example app
pnpm dev
```

## 📖 Documentation

- [Plugin Documentation](./packages/better-siws/README.md)
- [Example Implementation](./examples/nextjs-app/README.md)
- [Blog Post: Why I Built better-siws](./artifacts/blog-new-narrative.md)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT © [Yogesh Kothari](https://github.com/itsyogesh)