import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/lib/contexts/wallet-context";
import { Toaster } from "@/components/ui/sonner";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Better-SIWP | Sign In With Polkadot",
  description:
    "Production-ready Polkadot wallet authentication for Better-Auth. Part of the ZigZag ecosystem.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} font-sans antialiased`}>
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  );
}
