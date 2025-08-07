# Better-SIWS Complete Setup Guide

## 🚀 Quick Setup Commands

Run these commands in order to set up the entire project:

```bash
# 1. Create Next.js project
npx create-next-app@latest better-siws
cd better-siws

# 2. Install all dependencies
npm install better-auth drizzle-orm @neondatabase/serverless @polkadot/extension-dapp @polkadot/util @polkadot/util-crypto @polkadot/keyring @talismn/siws @tanstack/react-query class-variance-authority clsx lucide-react sonner tailwind-merge tailwindcss-animate

# 3. Install dev dependencies
npm install -D drizzle-kit

# 4. Initialize shadcn/ui
npx shadcn@latest init

# 5. Add shadcn/ui components
npx shadcn@latest add button card dialog badge sonner

# 6. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Neon database URL

# 7. Push database schema
npx drizzle-kit push

# 8. Run development server
npm run dev
```

## 📁 Complete File Structure

```
better-siws/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...all]/
│   │       │   └── route.ts
│   │       └── session/
│   │           └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── account-info.tsx
│   │   ├── auth-card.tsx
│   │   ├── connect-wallet-button.tsx
│   │   └── wallet-modal.tsx
│   ├── ui/
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── sonner.tsx
│   └── hero-section.tsx
├── lib/
│   ├── auth/
│   │   ├── polkadot-auth-client.ts
│   │   └── siws-adapter.ts
│   ├── contexts/
│   │   └── wallet-context.tsx
│   ├── db/
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── auth.ts
│   └── utils.ts
├── public/
├── drizzle.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.example
├── .env.local (create this)
├── .gitignore
└── README.md
```

## 🔧 Key Configuration Files

### 1. Environment Variables (.env.local)
```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Drizzle Config (drizzle.config.ts)
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

### 3. Main Authentication Flow
- User clicks "Connect Wallet"
- Modal detects installed wallets
- User connects with their preferred wallet
- App creates SIWS message with nonce
- User signs message in wallet
- Server verifies signature
- Better-Auth creates session
- User is authenticated!

## 🎯 Deployment Checklist

### Before Deploying:
- [ ] Set up Neon database
- [ ] Generate BETTER_AUTH_SECRET
- [ ] Test wallet connection locally
- [ ] Test sign in/out flow
- [ ] Check responsive design

### Vercel Deployment:
1. Push to GitHub
2. Import in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy!

## 🐛 Common Issues & Solutions

### "No wallet found"
- User needs to install a Polkadot wallet
- The modal will show installation links

### "Signature verification failed"
- Check that DATABASE_URL is correct
- Ensure BETTER_AUTH_SECRET is set
- Verify wallet is on correct network

### "Cannot connect to database"
- Check Neon connection string
- Ensure SSL mode is set to `require`
- Verify database is active

## 📚 Resources

- [Neon Dashboard](https://console.neon.tech)
- [Better-Auth Docs](https://www.better-auth.com/docs)
- [SIWS GitHub](https://github.com/TalismanSociety/siws)
- [Polkadot.js Extension](https://polkadot.js.org/extension/)

## 🤝 Support

- GitHub Issues: [github.com/yourusername/better-siws/issues](https://github.com/yourusername/better-siws/issues)
- Discord: [Join our Discord](https://discord.gg/your-discord)
- Twitter: [@yourusername](https://twitter.com/yourusername)

---

Happy building! 🚀 If you found this helpful, please star the repo and share it with the Polkadot community.