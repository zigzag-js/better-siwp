import { z } from "zod";
import { parseMessage, verifySIWS } from "@talismn/siws";
import { createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import type { BetterAuthPlugin } from "better-auth/types";
import type { BetterAuthUser, BetterAuthSession } from "./types";

/**
 * SIWS (Sign-In with Substrate) Plugin for Better Auth
 * 
 * This plugin enables Polkadot/Substrate wallet authentication in Better Auth applications.
 * It follows the SIWS standard created by Talisman and provides a similar API to Better Auth's
 * built-in SIWE plugin.
 * 
 * @example
 * ```typescript
 * import { betterAuth } from "better-auth";
 * import { siws } from "better-siws";
 * 
 * export const auth = betterAuth({
 *   plugins: [
 *     siws({
 *       domain: "example.com",
 *     }),
 *   ],
 * });
 * ```
 */

export interface SIWSOptions {
  /**
   * The domain requesting the signature (without protocol)
   * @example "example.com" or "localhost:3000"
   */
  domain: string;
  
  /**
   * Custom nonce generation function
   * @default Generates a random alphanumeric string
   */
  getNonce?: () => Promise<string>;
  
  /**
   * Custom message verification function
   * @default Uses verifySIWS from @talismn/siws
   */
  verifyMessage?: (params: {
    message: string;
    signature: string;
    address: string;
  }) => Promise<boolean>;
  
  /**
   * Function to extract/generate user info from the verified message
   */
  getUserInfo?: (params: {
    message: string;
    address: string;
    signature: string;
  }) => Promise<{
    id?: string;
    email?: string;
    name?: string;
    image?: string;
  }>;
  
  /**
   * Email domain for generated email addresses
   * @default Uses the main domain
   */
  emailDomainName?: string;
}

export const siws = (options: SIWSOptions): BetterAuthPlugin => ({
  id: "siws",
  endpoints: {
    getSiweNonce: createAuthEndpoint(
      "/siwe/nonce",
      {
        method: "POST",
        body: z.object({
          walletAddress: z.string().min(1),
        }),
      },
      async (ctx) => {
        const { walletAddress } = ctx.body;
        
        const nonce = options.getNonce 
          ? await options.getNonce()
          : Math.random().toString(36).substring(2, 15) + 
            Math.random().toString(36).substring(2, 15);
        
        await ctx.context.internalAdapter.createVerificationValue({
          identifier: `siws:${walletAddress}`,
          value: nonce,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        });
        
        return ctx.json({ nonce });
      }
    ),
    
    verifySiweMessage: createAuthEndpoint(
      "/siwe/verify",
      {
        method: "POST",
        body: z.object({
          message: z.string(),
          signature: z.string(),
          walletAddress: z.string(),
        }),
        requireRequest: true,
      },
      async (ctx) => {
        const { message, signature, walletAddress } = ctx.body;
        
        try {
          // Parse and validate the SIWS message
          const siwsMessage = parseMessage(message);
          
          if (siwsMessage.address !== walletAddress) {
            throw new Error("Address mismatch");
          }
          
          if (siwsMessage.domain !== options.domain) {
            throw new Error("Domain mismatch");
          }
          
          // Verify nonce
          const storedNonce = await ctx.context.internalAdapter.findVerificationValue(
            `siws:${walletAddress}`
          );
          
          if (!storedNonce || storedNonce.value !== siwsMessage.nonce) {
            throw new Error("Invalid or expired nonce");
          }
          
          // Delete nonce to prevent replay
          await ctx.context.internalAdapter.deleteVerificationValue(
            storedNonce.id
          );
          
          // Verify signature
          const isValid = options.verifyMessage
            ? await options.verifyMessage({ message, signature, address: walletAddress })
            : await verifySIWS(message, signature, walletAddress);
            
          if (!isValid) {
            throw new Error("Invalid signature");
          }
          
          // Get user info
          const userInfo = options.getUserInfo
            ? await options.getUserInfo({ message, address: walletAddress, signature })
            : {};
          
          // Generate email if not provided
          const emailDomain = options.emailDomainName || options.domain;
          const userEmail = (userInfo.email || `${walletAddress}@${emailDomain}`).toLowerCase();
          
          // Find or create user
          let user = await ctx.context.adapter.findOne({
            model: "user",
            where: [
              { field: "email", operator: "eq", value: userEmail }
            ]
          }) as BetterAuthUser | null;
          
          if (!user) {
            user = await ctx.context.internalAdapter.createUser({
              email: userEmail,
              name: userInfo.name || `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
              image: userInfo.image || "",
            }) as BetterAuthUser;
          }
          
          // Check if account exists for this wallet
          const existingAccount = await ctx.context.adapter.findOne({
            model: "account",
            where: [
              { field: "userId", operator: "eq", value: user.id },
              { field: "providerId", operator: "eq", value: "siws" },
              { field: "accountId", operator: "eq", value: walletAddress }
            ]
          });
          
          if (!existingAccount) {
            // Create account link
            await ctx.context.internalAdapter.createAccount({
              userId: user.id,
              providerId: "siws",
              accountId: walletAddress,
            });
          }
          
          // Create session
          const session = await ctx.context.internalAdapter.createSession(
            user!.id,
            ctx
          ) as BetterAuthSession | null;
          
          if (!session) {
            throw new Error("Failed to create session");
          }
          
          // Set session cookie
          await setSessionCookie(ctx, { 
            session, 
            user: {
              ...user!,
              emailVerified: !!user!.emailVerified // Convert to boolean
            }
          });
          
          return ctx.json({
            token: session.token,
            success: true,
            user: {
              id: user!.id,
              walletAddress,
            },
          });
        } catch (error) {
          return ctx.json(
            { error: error instanceof Error ? error.message : "Verification failed" },
            { status: 401 }
          );
        }
      }
    ),
  },
}) satisfies BetterAuthPlugin;

// Re-export types and utilities that might be useful
export type { SiwsMessage } from "@talismn/siws";
export { parseMessage, verifySIWS } from "@talismn/siws";

// Export client plugin
export { siwsClient } from "./client";