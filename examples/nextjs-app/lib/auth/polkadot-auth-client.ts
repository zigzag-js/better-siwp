import { SiwsMessage } from "@talismn/siws";

export class PolkadotAuthClient {
  private appName = "Better-SIWS";

  async connect(walletName?: string) {
    // Dynamically import browser-only modules
    const { web3Enable, web3Accounts } = await import("@polkadot/extension-dapp");
    
    // Enable all extensions first
    const allExtensions = await web3Enable(this.appName);
    
    if (allExtensions.length === 0) {
      throw new Error(
        "No Polkadot wallet found. Please install Polkadot.js extension or another compatible wallet."
      );
    }

    // If a specific wallet is requested, filter the extensions
    const extensions = walletName 
      ? allExtensions.filter(ext => ext.name === walletName)
      : allExtensions;
    
    if (walletName && extensions.length === 0) {
      throw new Error(`${walletName} wallet not found or access denied.`);
    }

    // Get accounts from all enabled extensions or specific wallet
    let accounts;
    if (walletName && extensions.length > 0) {
      // Get accounts only from the selected wallet
      accounts = await extensions[0].accounts.get();
    } else {
      // Get accounts from all wallets
      accounts = await web3Accounts();
    }
    
    if (accounts.length === 0) {
      throw new Error(
        "No accounts found. Please create or import an account in your wallet."
      );
    }

    return accounts;
  }

  async signIn(selectedAccount: any) {
    try {
      // Dynamically import browser-only modules
      const { web3FromAddress } = await import("@polkadot/extension-dapp");
      
      // 1. Request a nonce from Better-Auth
      const { authClient } = await import("@/lib/auth-client");
      const nonceResponse = await authClient.siwe.nonce({
        walletAddress: selectedAccount.address,
      });

      if (nonceResponse.error) {
        throw new Error(`Failed to get authentication nonce: ${nonceResponse.error.message || nonceResponse.error}`);
      }

      const { nonce } = nonceResponse.data || nonceResponse;

      // 2. Create a SIWS message
      const domain = window.location.host;
      const uri = window.location.origin;
      
      const siwsMessage = new SiwsMessage({
        domain,
        address: selectedAccount.address,
        statement: "Sign in with your Polkadot wallet to Better-SIWS",
        uri,
        version: "1.0.0",
        chainId: "polkadot:91b171bb158e2d3848fa23a9f1c25182",
        nonce,
        issuedAt: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      });

      const message = siwsMessage.prepareMessage();

      // 3. Get the injector for the selected account
      const injector = await web3FromAddress(selectedAccount.address);
      
      // 4. Request signature from the wallet
      const signResult = await injector.signer.signRaw!({
        address: selectedAccount.address,
        data: message,
        type: "bytes",
      });

      if (!signResult) {
        throw new Error("Signing cancelled by user");
      }

      // 5. Verify the signature with Better-Auth
      const verifyResponse = await authClient.siwe.verify({
        message,
        signature: signResult.signature,
        walletAddress: selectedAccount.address,
      });

      if (verifyResponse.error) {
        throw new Error(`Authentication failed: ${verifyResponse.error.message || verifyResponse.error}`);
      }

      const authData = verifyResponse.data || verifyResponse;
      if (!authData || (!authData.success && !authData.token)) {
        throw new Error("Authentication failed: Invalid response");
      }

      return authData;

    } catch (error) {
      throw error;
    }
  }

  async signOut() {
    const response = await fetch("/api/auth/sign-out", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Sign out failed");
    }

    return true;
  }
}