'use client';

import { useState } from 'react';

export default function WalletButton() {
  const [address, setAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && 'stellar' in window) {
      try {
        const result = await (window as any).stellar.request({ method: 'connect' });
        setAddress(result.address);
      } catch {
        alert('Wallet connection cancelled or failed.');
      }
    } else {
      alert('Freighter wallet extension not detected. Please install Freighter.');
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
  };

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#94a3b8] font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={disconnectWallet}
          className="px-3 py-1.5 text-sm rounded-lg border border-[#334155] text-[#94a3b8] hover:text-white hover:border-[#475569] transition-colors font-mono"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="px-4 py-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white font-semibold rounded-lg hover:from-[#2563eb] hover:to-[#7c3aed] transition-all font-mono"
    >
      Connect Wallet
    </button>
  );
}
