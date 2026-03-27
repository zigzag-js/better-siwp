import type { BetterAuthClientPlugin } from "better-auth/client";
import type { siwp } from ".";

/**
 * SIWP Client Plugin for Better Auth
 *
 * Provides client-side methods for interacting with the SIWP authentication flow.
 * Uses $InferServerPlugin to automatically infer type-safe endpoints from the server plugin.
 */
export const siwpClient = () => {
  return {
    id: "siwp",
    $InferServerPlugin: {} as ReturnType<typeof siwp>,
  } satisfies BetterAuthClientPlugin;
};
