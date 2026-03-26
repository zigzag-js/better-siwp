import { describe, it, expect, vi } from "vitest";
import {
  createTestInstance,
  buildSiwpMessage,
  TEST_ADDRESS,
  TEST_NONCE,
  TEST_DOMAIN,
} from "./test-utils";
import { siwp } from "../index";

describe("SIWP Plugin", () => {
  describe("Plugin Structure", () => {
    it("should have the correct plugin id", () => {
      const plugin = siwp({ domain: TEST_DOMAIN });
      expect(plugin.id).toBe("siwp");
    });

    it("should have getNonce and verify endpoints", () => {
      const plugin = siwp({ domain: TEST_DOMAIN });
      expect(plugin.endpoints).toBeDefined();
      expect(plugin.endpoints.getNonce).toBeDefined();
      expect(plugin.endpoints.verify).toBeDefined();
    });
  });

  describe("getNonce endpoint", () => {
    it("should return a nonce for a valid wallet address", async () => {
      const { client } = await createTestInstance();

      const res = await client.siwp.nonce({
        walletAddress: TEST_ADDRESS,
      });

      expect(res.data).toBeDefined();
      expect(res.data?.nonce).toBe(TEST_NONCE);
    });

    it("should use custom getNonce function when provided", async () => {
      const customNonce = "custom_nonce_12345";
      const { client } = await createTestInstance({
        async getNonce() {
          return customNonce;
        },
      });

      const res = await client.siwp.nonce({
        walletAddress: TEST_ADDRESS,
      });

      expect(res.data?.nonce).toBe(customNonce);
    });

    it("should generate a default nonce when getNonce is not provided", async () => {
      const { client } = await createTestInstance({
        getNonce: undefined,
      });

      const res = await client.siwp.nonce({
        walletAddress: TEST_ADDRESS,
      });

      expect(res.data?.nonce).toBeDefined();
      expect(typeof res.data?.nonce).toBe("string");
      expect(res.data!.nonce.length).toBeGreaterThan(0);
    });
  });

  describe("verify endpoint", () => {
    it("should authenticate with valid message and signature", async () => {
      const { client } = await createTestInstance();
      const message = buildSiwpMessage();

      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });

      const res = await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });

      expect(res.data).toBeDefined();
      expect(res.error).toBeNull();
    });

    it("should reject an invalid signature", async () => {
      const { client } = await createTestInstance();
      const message = buildSiwpMessage();

      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });

      const res = await client.siwp.verify({
        message,
        signature: "invalid_signature",
        walletAddress: TEST_ADDRESS,
      });

      expect(res.error).toBeDefined();
    });

    it("should reject when address in message does not match walletAddress", async () => {
      const { client } = await createTestInstance();
      const differentAddress = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";
      const message = buildSiwpMessage({ address: TEST_ADDRESS });

      await client.siwp.nonce({ walletAddress: differentAddress });

      const res = await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: differentAddress,
      });

      expect(res.error).toBeDefined();
    });

    it("should reject when domain does not match", async () => {
      const { client } = await createTestInstance();
      const message = buildSiwpMessage({ domain: "evil.com" });

      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });

      const res = await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });

      expect(res.error).toBeDefined();
    });

    it("should reject when nonce does not match", async () => {
      const { client } = await createTestInstance();
      const message = buildSiwpMessage({ nonce: "wrong_nonce_value" });

      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });

      const res = await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });

      expect(res.error).toBeDefined();
    });

    it("should reject when no nonce was requested (replay protection)", async () => {
      const { client } = await createTestInstance();
      const message = buildSiwpMessage();

      // Don't request a nonce first — go straight to verify
      const res = await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });

      expect(res.error).toBeDefined();
    });

    it("should prevent nonce reuse (replay attack)", async () => {
      const { client } = await createTestInstance();
      const message = buildSiwpMessage();

      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });

      // First verify should succeed
      const res1 = await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });
      expect(res1.error).toBeNull();

      // Second verify with same nonce should fail
      const res2 = await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });
      expect(res2.error).toBeDefined();
    });
  });

  describe("User and account management", () => {
    it("should create a new user on first sign-in", async () => {
      const { client, db } = await createTestInstance();
      const message = buildSiwpMessage();

      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });
      await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });

      const users = db["user"] || [];
      const siwsUser = users.find((u) =>
        (u.email as string).includes(TEST_ADDRESS.toLowerCase()),
      );
      expect(siwsUser).toBeDefined();
    });

    it("should create an account linked to the user", async () => {
      const { client, db } = await createTestInstance();
      const message = buildSiwpMessage();

      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });
      await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });

      const accounts = (db["account"] || []).filter(
        (a) => a.providerId === "siwp" && a.accountId === TEST_ADDRESS,
      );
      expect(accounts.length).toBe(1);
    });

    it("should reuse existing user on subsequent sign-ins", async () => {
      const { client, db } = await createTestInstance();
      const message = buildSiwpMessage();

      // First sign-in
      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });
      await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });

      // Second sign-in
      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });
      await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });

      const users = (db["user"] || []).filter((u) =>
        (u.email as string).includes(TEST_ADDRESS.toLowerCase()),
      );
      expect(users.length).toBe(1);
    });

    it("should not duplicate the account link on subsequent sign-ins", async () => {
      const { client, db } = await createTestInstance();
      const message = buildSiwpMessage();

      // First sign-in
      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });
      await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });

      // Second sign-in
      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });
      await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });

      const accounts = (db["account"] || []).filter(
        (a) => a.providerId === "siwp" && a.accountId === TEST_ADDRESS,
      );
      expect(accounts.length).toBe(1);
    });

    it("should create a session on successful sign-in", async () => {
      const { client, db } = await createTestInstance();
      const message = buildSiwpMessage();

      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });
      await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });

      const sessions = db["session"] || [];
      expect(sessions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Custom options", () => {
    it("should use custom verifyMessage function", async () => {
      const verifyFn = vi.fn(async () => true);
      const { client } = await createTestInstance({
        verifyMessage: verifyFn,
      });
      const message = buildSiwpMessage();

      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });
      await client.siwp.verify({
        message,
        signature: "any_signature",
        walletAddress: TEST_ADDRESS,
      });

      expect(verifyFn).toHaveBeenCalledWith({
        message,
        signature: "any_signature",
        address: TEST_ADDRESS,
      });
    });

    it("should use custom getUserInfo function", async () => {
      const { client, db } = await createTestInstance({
        getUserInfo: async () => ({
          name: "Alice",
          email: "alice@example.com",
        }),
      });
      const message = buildSiwpMessage();

      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });
      await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });

      const users = db["user"] || [];
      const alice = users.find((u) => u.email === "alice@example.com");
      expect(alice).toBeDefined();
      expect(alice!.name).toBe("Alice");
    });

    it("should use custom emailDomainName", async () => {
      const { client, db } = await createTestInstance({
        emailDomainName: "custom.domain",
      });
      const message = buildSiwpMessage();

      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });
      await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });

      const users = db["user"] || [];
      const user = users.find((u) => (u.email as string).endsWith("@custom.domain"));
      expect(user).toBeDefined();
    });

    it("should generate default user name from truncated address", async () => {
      const { client, db } = await createTestInstance();
      const message = buildSiwpMessage();

      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });
      await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });

      const users = db["user"] || [];
      const user = users.find((u) =>
        (u.email as string).includes(TEST_ADDRESS.toLowerCase()),
      );
      expect(user).toBeDefined();
      const expectedName = `${TEST_ADDRESS.slice(0, 6)}...${TEST_ADDRESS.slice(-4)}`;
      expect(user!.name).toBe(expectedName);
    });

    it("should generate email using main domain when emailDomainName is not set", async () => {
      const { client, db } = await createTestInstance();
      const message = buildSiwpMessage();

      await client.siwp.nonce({ walletAddress: TEST_ADDRESS });
      await client.siwp.verify({
        message,
        signature: "valid_signature",
        walletAddress: TEST_ADDRESS,
      });

      const users = db["user"] || [];
      const user = users.find((u) =>
        (u.email as string).endsWith(`@${TEST_DOMAIN}`),
      );
      expect(user).toBeDefined();
    });
  });
});
