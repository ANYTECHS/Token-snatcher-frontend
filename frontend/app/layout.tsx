import type { Metadata } from "next";
import "./globals.css";
import WalletButton from "@/components/WalletButton";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Token Snatcher",
  description: "A decentralized arcade game - snatch tokens and earn on-chain rewards!",
};

import { WalletProvider } from "../context/WalletContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
