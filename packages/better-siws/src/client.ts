import type { BetterAuthClientPlugin } from "better-auth/client";

/**
 * SIWS Client Plugin for Better Auth
 * 
 * Provides client-side methods for interacting with the SIWS authentication flow.
 * This plugin mirrors the server plugin and provides type-safe methods for:
 * - Generating nonces
 * - Verifying SIWS messages
 */
export const siwsClient = (): BetterAuthClientPlugin => ({
  id: "siws",
  getActions: (fetch) => ({
    siwe: {
      nonce: async (data: { walletAddress: string }) => {
        return fetch("/siwe/nonce", {
          method: "POST",
          body: data,
        });
      },
      verify: async (data: { 
        message: string; 
        signature: string; 
        walletAddress: string;
      }) => {
        return fetch("/siwe/verify", {
          method: "POST",
          body: data,
        });
      },
    },
  }),
});