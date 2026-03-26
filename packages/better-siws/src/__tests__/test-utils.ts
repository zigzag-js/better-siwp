import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { createAuthClient } from "better-auth/client";
import { siwp, type SIWPOptions } from "../index";
import { siwpClient } from "../client";

type MemoryDB = Record<string, Record<string, unknown>[]>;

export const TEST_DOMAIN = "localhost:3000";
export const TEST_NONCE = "A1b2C3d4E5f6G7h8J";
export const TEST_ADDRESS = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

export function buildSiwpMessage(opts: {
  domain?: string;
  address?: string;
  nonce?: string;
  uri?: string;
  statement?: string;
  chainName?: string;
} = {}) {
  const {
    domain = TEST_DOMAIN,
    address = TEST_ADDRESS,
    nonce = TEST_NONCE,
    uri = "http://localhost:3000",
    statement = "Sign in with your Polkadot wallet",
    chainName = "Polkadot",
  } = opts;
  return JSON.stringify({
    domain,
    address,
    nonce,
    uri,
    statement,
    chainName,
    version: "1.0.0",
    issuedAt: Date.now(),
  });
}

export async function createTestInstance(pluginOpts?: Partial<SIWPOptions>) {
  // Pre-seed with all required model tables for the memory adapter
  const db: MemoryDB = {
    user: [],
    account: [],
    session: [],
    verification: [],
  };

  const auth = betterAuth({
    baseURL: "http://localhost:3000",
    secret: "test-secret-at-least-32-chars-long!!",
    database: memoryAdapter(db),
    plugins: [
      siwp({
        domain: TEST_DOMAIN,
        async getNonce() {
          return TEST_NONCE;
        },
        async verifyMessage({ signature }) {
          return signature === "valid_signature";
        },
        ...pluginOpts,
      }),
    ],
  });

  const client = createAuthClient({
    baseURL: "http://localhost:3000",
    plugins: [siwpClient()],
    fetchOptions: {
      customFetchImpl: async (url, init) => {
        const req = new Request(url, init);
        return auth.handler(req);
      },
    },
  });

  return { client, auth, db };
}
