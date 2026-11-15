"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { WalletService } from "../services/wallet.service";
import {
  WalletErrorCode,
  WalletErrorDetails,
  handleAndLogWalletError,
} from "../utils/walletErrors";

interface WalletContextProps {
  address: string | null;
  isConnected: boolean;
  connectionStatus: "loading" | "connected" | "disconnected";
  connect: () => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
  error: string | null;
  errorCode: WalletErrorCode | null;
  errorDetails: WalletErrorDetails | null;
  isLoading: boolean;
  network: string | null;
  isNetworkValid: boolean;
  supportedNetwork: string;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<WalletErrorDetails | null>(null);
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
        const reconnectedAddress = await WalletService.attemptSilentReconnect();
        if (reconnectedAddress === cachedAddress) {
          setAddress(reconnectedAddress);
          // Check network after reconnecting
          const currentNetwork = await WalletService.getCurrentNetwork();
          setNetwork(currentNetwork);
          const networkValid = await WalletService.isNetworkValid();
          setIsNetworkValid(networkValid);
          return;
        }
      } catch (err) {
        handleAndLogWalletError(err, "restoreWallet");
      }
      WalletService.disconnectWallet();
      setAddress(null);
      setNetwork(null);
      setIsNetworkValid(false);
    };

    restoreWallet().finally(() => setIsLoading(false));
  }, []);

  const clearError = () => {
    setErrorDetails(null);
  };

  const connect = async () => {
    setIsLoading(true);
    setErrorDetails(null);
    try {
      const pubKey = await WalletService.connectWallet();
      if (!pubKey || typeof pubKey !== "string") {
        throw new Error("Failed to retrieve wallet address.");
      }

      setAddress(pubKey);
      WalletService.cacheAddress(pubKey);
      // Check network after connecting
      const currentNetwork = await WalletService.getCurrentNetwork();
      setNetwork(currentNetwork);
      const networkValid = await WalletService.isNetworkValid();
      setIsNetworkValid(networkValid);
    } catch (err) {
      const classified = handleAndLogWalletError(err, "connect");
      setErrorDetails(classified);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setErrorDetails(null);
    setNetwork(null);
    setIsNetworkValid(false);
    try {
      WalletService.disconnectWallet();
    } catch (err) {
      handleAndLogWalletError(err, "disconnect");
    }
  };

  return (
    <WalletContext.Provider 
      value={{ 
        address, 
        isConnected: !!address,
        connectionStatus: isLoading ? "loading" : (!!address ? "connected" : "disconnected"),
        connect, 
        disconnect,
        clearError,
        error: errorDetails?.userMessage ?? null,
        errorCode: errorDetails?.code ?? null,
        errorDetails,
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
