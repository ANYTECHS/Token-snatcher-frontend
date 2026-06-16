import type { Metadata } from "next";
import "./globals.css";
import WalletButton from "@/components/WalletButton";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Token Snatcher",
  description: "A decentralized arcade game - snatch tokens and earn on-chain rewards!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0a0a0a] text-white font-sans">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <Link href="/" className="text-xl font-bold font-mono text-white hover:text-[#3b82f6] transition-colors">
            Token Snatcher
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/free" className="text-sm font-mono text-[#94a3b8] hover:text-white transition-colors">
              Free Play
            </Link>
            <Link href="/ranked" className="text-sm font-mono text-[#94a3b8] hover:text-white transition-colors">
              Ranked
            </Link>
            <Link href="/leaderboard" className="text-sm font-mono text-[#94a3b8] hover:text-white transition-colors">
              Leaderboard
            </Link>
            <WalletButton />
          </div>
        </nav>
        <main className="min-h-[calc(100vh-65px)]">
          {children}
        </main>
      </body>
    </html>
  );
}
