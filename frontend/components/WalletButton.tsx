"use client";

import React from "react";
import { useWallet } from "../context/WalletContext";

export const WalletButton = () => {
  const { address, isConnected, connect, disconnect, error, isLoading } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex flex-col gap-2 relative">
        <div className="flex items-center gap-4 p-2 bg-gray-100 dark:bg-zinc-800 rounded-full border border-gray-200 dark:border-zinc-700">
          <div 
            className="flex items-center gap-2 pl-2 cursor-pointer relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-mono">
              {formatAddress(address)}
            </span>
            {showTooltip && (
              <div className="absolute top-full left-0 mt-1 px-2 py-1 text-xs bg-gray-900 dark:bg-zinc-950 text-white dark:text-zinc-100 rounded border border-gray-700 dark:border-zinc-700 whitespace-nowrap z-50">
                {address}
              </div>
            )}
          </div>
          <button
            onClick={disconnect}
            className="px-4 py-1.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-full transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={connect}
        disabled={isLoading}
        className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-full shadow-sm transition-colors"
      >
        {isLoading ? "Connecting..." : "Connect Wallet"}
      </button>
      {error && (
        <div className="px-4 py-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default WalletButton;
