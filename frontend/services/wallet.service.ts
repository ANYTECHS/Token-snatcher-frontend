export interface WalletInfo {
  address: string;
  publicKey: string;
}

export async function connectWallet(): Promise<WalletInfo | null> {
  if (typeof window === 'undefined') return null;

  if ('stellar' in window) {
    try {
      const result = await (window as any).stellar.request({ method: 'connect' });
      return {
        address: result.address,
        publicKey: result.publicKey ?? result.address,
      };
    } catch {
      return null;
    }
  }

  return null;
}

export async function getWalletAddress(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  if ('stellar' in window) {
    try {
      const result = await (window as any).stellar.request({ method: 'getAddress' });
      return result.address;
    } catch {
      return null;
    }
  }

  return null;
}

export function isWalletInstalled(): boolean {
  return typeof window !== 'undefined' && 'stellar' in window;
}
