"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAccount } from "@luno-kit/react";
import { useSignMessage } from "@luno-kit/react";
import {
  signInWithPolkadot,
  signOutFromPolkadot,
} from "@/lib/auth/polkadot-auth-client";
import { toast } from "sonner";

interface UserInfo {
  address: string;
  walletAddress?: string;
  email?: string;
  name?: string;
  id?: string;
}

interface AuthContextType {
  isSigningIn: boolean;
  isAuthenticated: boolean;
  user: UserInfo | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { account } = useAccount();
  const { signMessageAsync } = useSignMessage();
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
          const walletAddress = data.user?.email?.includes("@")
            ? data.user.email.split("@")[0]
            : data.user?.email;
          setUser({
            ...data.user,
            address: walletAddress || data.user?.walletAddress,
          });
        }
      }
    } catch (error) {
      console.error("Failed to check auth status:", error);
    }
  };

  const signIn = async () => {
    if (!account) {
      toast.error("Please connect a wallet first");
      return;
    }
    setIsSigningIn(true);
    try {
      await signInWithPolkadot(account.address, signMessageAsync);
      await checkAuthStatus();
      if (!isAuthenticated) {
        setIsAuthenticated(true);
        setUser({
          address: account.address,
          walletAddress: account.address,
        });
      }
      toast.success("Signed in successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to sign in"
      );
      throw error;
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    try {
      await signOutFromPolkadot();
      setIsAuthenticated(false);
      setUser(null);
      toast.success("Signed out successfully");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <AuthContext.Provider
      value={{ isSigningIn, isAuthenticated, user, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
