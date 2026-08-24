"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { WalletService } from "../services/wallet.service";

interface WalletContextProps {
  address: string | null;
  isConnected: boolean;
  connectionStatus: "loading" | "connected" | "disconnected";
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
  isLoading: boolean;
  network: string | null;
  isNetworkValid: boolean;
  supportedNetwork: string;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [network, setNetwork] = useState<string | null>(null);
  const [isNetworkValid, setIsNetworkValid] = useState(false);
  const supportedNetwork = WalletService.getSupportedNetwork();

  useEffect(() => {
    const restoreWallet = async () => {
      const cachedAddress = WalletService.getCachedAddress();
      if (!cachedAddress) return;

      setIsLoading(true);
      try {
        const address = await WalletService.attemptSilentReconnect();
        if (address === cachedAddress) {
          setAddress(address);
          // Check network after reconnecting
          const currentNetwork = await WalletService.getCurrentNetwork();
          setNetwork(currentNetwork);
          const networkValid = await WalletService.isNetworkValid();
          setIsNetworkValid(networkValid);
          return;
        }
      } catch {
        // Fall through to disconnect
      }
      WalletService.disconnectWallet();
      setAddress(null);
      setNetwork(null);
      setIsNetworkValid(false);
    };

    restoreWallet().finally(() => setIsLoading(false));
  }, []);

  const connect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pubKey = await WalletService.connectWallet();
      if (pubKey) {
        setAddress(pubKey);
        WalletService.cacheAddress(pubKey);
        // Check network after connecting
        const currentNetwork = await WalletService.getCurrentNetwork();
        setNetwork(currentNetwork);
        const networkValid = await WalletService.isNetworkValid();
        setIsNetworkValid(networkValid);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMessage);
      console.error("Connection error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setError(null);
    setNetwork(null);
    setIsNetworkValid(false);
    WalletService.disconnectWallet();
  };

  return (
    <WalletContext.Provider 
      value={{ 
        address, 
        isConnected: !!address,
        connectionStatus: isLoading ? "loading" : (!!address ? "connected" : "disconnected"),
        connect, 
        disconnect,
        error,
        isLoading,
        network,
        isNetworkValid,
        supportedNetwork
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextProps => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
