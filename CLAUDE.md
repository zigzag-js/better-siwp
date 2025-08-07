# Better-SIWS Project Context

## Overview
This project implements Sign-In with Substrate (SIWS) authentication using Better-Auth for Polkadot/Substrate wallets. It serves two purposes:
1. A working demo implementation that people can test and use
2. A comprehensive tutorial blog post to help developers implement this themselves

## Key Information
- **GitHub Repository**: https://github.com/itsyogesh/better-siws
- **Author**: Yogesh (@itsyogesh18 on Twitter)
- **Local Database**: PostgreSQL database named `better-siws` (for development)
- **Production Database**: Neon PostgreSQL (for deployment and blog tutorial)

## Project Structure
- `/app` - Next.js 15 app router implementation
- `/components` - React components (auth components, UI components)
- `/lib` - Core authentication logic, database config, utilities
- `/artifacts` - Documentation files:
  - `quick-setup-guide.md` - Step-by-step setup instructions
  - `blog.md` - Tutorial blog post (needs personalization)

## Development Setup
1. Use local PostgreSQL database `better-siws` (already configured in .env)
2. Install dependencies as listed in quick-setup-guide.md
3. Run database migrations with `npx drizzle-kit push`
4. Start dev server with `npm run dev`

## Current Status
- Setup guide is complete and tested
- Blog post draft is written but needs more personal touch
- Implementation needs to be done based on the setup guide
- All code examples in blog are production-ready

## Technical Stack
- **Framework**: Next.js 15 with App Router
- **Authentication**: Better-Auth with custom SIWS plugin
- **Database**: PostgreSQL (local) / Neon (production)
- **ORM**: Drizzle ORM
- **UI**: shadcn/ui components with Tailwind CSS
- **Wallet Integration**: Polkadot.js extension API
- **SIWS Implementation**: @talismn/siws library

## Motivation
The project was created because:
1. Better-Auth recently added SIWE plugin support
2. Talisman team created SIWS - an SIWE-compatible library for Polkadot
3. There's a gap in the market for easy Polkadot authentication
4. The author has experience in both Polkadot and web development
5. Better-Auth provides excellent developer experience

## Important Notes
- The blog tutorial uses Neon for easier setup for readers
- Local development uses regular PostgreSQL
- All wallet addresses and cryptography use Substrate's sr25519
- The implementation is production-ready and secure

## Testing Checklist
- [ ] Connect with Polkadot.js extension
- [ ] Connect with Talisman wallet
- [ ] Connect with SubWallet
- [ ] Sign message and authenticate
- [ ] Session persistence works
- [ ] Sign out functionality
- [ ] Error handling for no wallet installed
- [ ] Multiple account selection