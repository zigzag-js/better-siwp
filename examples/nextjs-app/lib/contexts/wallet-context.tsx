"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PolkadotAuthClient } from "@/lib/auth/polkadot-auth-client";
import { toast } from "sonner";

interface Account {
  address: string;
  name?: string;
  source?: string;
  type?: string;
}

interface UserInfo {
  address: string;
  walletAddress?: string;
  email?: string;
  name?: string;
  id?: string;
}

interface WalletContextType {
  accounts: Account[];
  selectedAccount: Account | null;
  isConnecting: boolean;
  isSigningIn: boolean;
  isAuthenticated: boolean;
  user: UserInfo | null;
  connect: (walletName?: string) => Promise<void>;
  signIn: (account?: Account) => Promise<void>;
  signOut: () => Promise<void>;
  setSelectedAccount: (account: Account) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new PolkadotAuthClient());
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        if (data.session) {
          setIsAuthenticated(true);
          // Extract wallet address from email if it's in the format address@domain
          const walletAddress = data.user?.email?.includes('@') 
            ? data.user.email.split('@')[0] 
            : data.user?.email;
          setUser({
            ...data.user,
            address: walletAddress || data.user?.walletAddress
          });
        }
      }
    } catch (error) {
      console.error("Failed to check auth status:", error);
    }
  };

  const connect = async (walletName?: string) => {
    setIsConnecting(true);
    try {
      const connectedAccounts = await client.connect(walletName);
      setAccounts(connectedAccounts);
      
      if (connectedAccounts.length > 0) {
        setSelectedAccount(connectedAccounts[0]);
      }
      
      toast.success("Wallet connected successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect wallet");
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const signIn = async (account = selectedAccount) => {
    if (!account) {
      toast.error("Please select an account");
      return;
    }

    setIsSigningIn(true);
    try {
      await client.signIn(account);

      // Refresh the session to get the latest user data
      await checkAuthStatus();
      
      // If checkAuthStatus didn't update, use the response data
      if (!isAuthenticated) {
        setIsAuthenticated(true);
        setUser({
          address: account.address,
          walletAddress: account.address,
        });
      }
      
      toast.success("Signed in successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
      throw error;
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    try {
      await client.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setSelectedAccount(null);
      setAccounts([]);
      toast.success("Signed out successfully");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <WalletContext.Provider
      value={{
        accounts,
        selectedAccount,
        isConnecting,
        isSigningIn,
        isAuthenticated,
        user,
        connect,
        signIn,
        signOut,
        setSelectedAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}