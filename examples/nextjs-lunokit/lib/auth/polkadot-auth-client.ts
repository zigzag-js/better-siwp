import { SiwsMessage } from "@talismn/siws";
import { polkadot } from "@zig-zag/chains";
import { authClient } from "@/lib/auth-client";

export async function signInWithPolkadot(
  address: string,
  signMessage: (params: { message: string }) => Promise<{ signature: string }>
) {
  // 1. Request nonce
  const nonceResponse = await authClient.siwp.nonce({
    walletAddress: address,
  });
  if (nonceResponse.error) {
    throw new Error(`Failed to get nonce: ${JSON.stringify(nonceResponse.error)}`);
  }
  const { nonce } = nonceResponse.data;

  // 2. Build SIWS message
  const domain = window.location.host;
  const uri = window.location.origin;
  const siwsMessage = new SiwsMessage({
    domain,
    address,
    statement: "Sign in with your Polkadot wallet",
    uri,
    version: "1.0.0",
    chainId: `${polkadot.network}:${polkadot.genesisHash.slice(2, 34)}`,
    nonce,
    issuedAt: Date.now(),
    expirationTime: Date.now() + 24 * 60 * 60 * 1000,
  });
  const message = siwsMessage.prepareMessage();

  // 3. Sign via LunoKit
  const { signature } = await signMessage({ message });

  // 4. Verify with server
  const verifyResponse = await authClient.siwp.verify({
    message,
    signature,
    walletAddress: address,
  });
  if (verifyResponse.error) {
    throw new Error(
      `Authentication failed: ${verifyResponse.error.message || verifyResponse.error}`
    );
  }
  const authData = verifyResponse.data;
  if (!authData || "error" in authData) {
    throw new Error("Authentication failed: Invalid response");
  }
  return authData;
}

export async function signOutFromPolkadot() {
  const response = await fetch("/api/auth/sign-out", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
    credentials: "include",
  });
  if (!response.ok) throw new Error("Sign out failed");
  return true;
}
