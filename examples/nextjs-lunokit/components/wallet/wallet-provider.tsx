"use client";

import { useState, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LunoKitProvider } from "@luno-kit/ui";
import { walletConfig } from "@/config/wallet";

const lunoTheme = {
  colors: {
    accentColor: "#E6007A",
    connectButtonBackground: "#18181b",
    connectButtonInnerBackground: "#18181b",
    connectButtonText: "#fafafa",
    modalBackground: "#09090b",
    modalBackdrop: "rgba(0, 0, 0, 0.7)",
    modalBorder: "#27272a",
    modalText: "#fafafa",
    modalTextSecondary: "#a1a1aa",
    walletSelectItemBackground: "#18181b",
    walletSelectItemBackgroundHover: "#27272a",
    walletSelectItemText: "#fafafa",
    separatorLine: "#27272a",
  },
  fonts: {
    body: "var(--font-sans), system-ui, sans-serif",
  },
  radii: {
    modal: "16px",
    connectButton: "12px",
    walletSelectItem: "10px",
  },
} as const;

export function WalletProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LunoKitProvider config={walletConfig} theme={lunoTheme}>
        {children}
      </LunoKitProvider>
    </QueryClientProvider>
  );
}
