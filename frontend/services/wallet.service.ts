import {
  isConnected,
  requestAccess,
  getAddress,
  getNetwork,
} from "@stellar/freighter-api";
import {
  PersistedWalletSession,
  DEFAULT_SESSION_TTL_MS,
  saveWalletSession,
  loadWalletSession,
  clearWalletSession,
} from "../utils/walletSession";

export class WalletService {
  // Supported Stellar network (can be configured via environment variable)
  private static readonly SUPPORTED_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "PUBLIC";

  /**
   * Checks if Freighter wallet is installed
   */
  static async isFreighterInstalled(): Promise<boolean> {
    try {
      return await isConnected().then(result => !!result?.isConnected);
    } catch {
      return false;
    }
  }

  /**
   * Requests access to the user's Freighter wallet
   * @returns The user's public key (Stellar address) if successful, or null
   * @throws Error with user-friendly message if connection fails
   */
  static async connectWallet(): Promise<string | null> {
    try {
      const installed = await this.isFreighterInstalled();
      if (!installed) {
        throw new Error("Freighter wallet is not installed. Please install it to continue.");
      }

      const result = await requestAccess();
      if (result.error) {
        throw new Error(result.error.message || "Wallet access denied.");
      }

      const { address, error } = await getAddress();
      if (error) {
        throw new Error(error.message || "Failed to retrieve wallet address.");
      }
      if (!address) {
        throw new Error("Failed to retrieve wallet address.");
      }

      const currentNetwork = await this.getCurrentNetwork();
      saveWalletSession(address, currentNetwork, DEFAULT_SESSION_TTL_MS);

      return address;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to connect wallet";
      console.error("Wallet connection error:", message);
      throw error;
    }
  }

  /**
   * Disconnects the wallet by clearing persisted session state
   */
  static disconnectWallet(): void {
    clearWalletSession();
  }

  /**
   * Gets the active non-expired wallet session from local storage
   */
  static getActiveSession(): PersistedWalletSession | null {
    return loadWalletSession();
  }

  /**
   * Gets the cached wallet address from local storage if the session has not expired
   */
  static getCachedAddress(): string | null {
    const session = loadWalletSession();
    return session ? session.address : null;
  }

  /**
   * Caches the wallet address and optional network into a TTL-bounded local session
   */
  static cacheAddress(address: string, network: string | null = null, ttlMs: number = DEFAULT_SESSION_TTL_MS): void {
    saveWalletSession(address, network, ttlMs);
  }

  /**
   * Silently attempts to reconnect a previously authorized wallet
   * without showing any popups. Clears expired or revoked sessions automatically.
   */
  static async attemptSilentReconnect(): Promise<string | null> {
    try {
      const session = loadWalletSession();
      if (!session) {
        return null;
      }

      const connected = await isConnected();
      if (!connected?.isConnected) {
        clearWalletSession();
        return null;
      }
      const { address } = await getAddress();
      if (!address || address !== session.address) {
        clearWalletSession();
        return null;
      }

      const currentNetwork = await this.getCurrentNetwork();
      saveWalletSession(address, currentNetwork ?? session.network, DEFAULT_SESSION_TTL_MS);
      return address;
    } catch {
      clearWalletSession();
      return null;
    }
  }

  /**
   * Gets the current Stellar network from the connected wallet
   * @returns The network name ("PUBLIC", "TESTNET", etc.) or null if unable to detect
   */
  static async getCurrentNetwork(): Promise<string | null> {
    try {
      const network = await getNetwork();
      return network?.network || null;
    } catch (error) {
      console.error("Failed to get network:", error);
      return null;
    }
  }

  /**
   * Validates that the current wallet network matches the supported network
   * @returns true if the network is valid, false otherwise
   */
  static async isNetworkValid(): Promise<boolean> {
    try {
      const currentNetwork = await this.getCurrentNetwork();
      if (!currentNetwork) {
        return false;
      }
      return currentNetwork === this.SUPPORTED_NETWORK;
    } catch {
      return false;
    }
  }

  /**
   * Gets the supported network configuration
   */
  static getSupportedNetwork(): string {
    return this.SUPPORTED_NETWORK;
  }
}
