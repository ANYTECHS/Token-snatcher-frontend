import { WalletService } from './wallet.service';

export interface SessionResult {
  sessionId: string;
  success: boolean;
  reward?: string;
  error?: string;
}

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID ?? '';

/**
 * Validates network before executing blockchain operations
 * @throws Error if network is invalid
 */
async function validateNetwork(): Promise<void> {
  const isNetworkValid = await WalletService.isNetworkValid();
  if (!isNetworkValid) {
    const currentNetwork = await WalletService.getCurrentNetwork();
    const supportedNetwork = WalletService.getSupportedNetwork();
    throw new Error(
      `Invalid network. Your wallet is on "${currentNetwork}" but this app requires "${supportedNetwork}". Please switch your network in Freighter settings.`
    );
  }
}

export async function startSession(playerAddress: string): Promise<string | null> {
  if (!CONTRACT_ID) {
    console.warn('Contract ID not configured. Session ID will be simulated.');
    return `sim-session-${Date.now()}`;
  }

  try {
    await validateNetwork();
    
    if (typeof window !== 'undefined' && 'stellar' in window) {
      const result = await (window as any).stellar.request({
        method: 'invokeContract',
        params: {
          contractId: CONTRACT_ID,
          functionName: 'start_session',
          args: [playerAddress],
        },
      });
      return result.result as string;
    }
  } catch (error) {
    console.error('Failed to start session:', error);
    throw error;
  }

  return null;
}

export async function submitScore(
  sessionId: string,
  score: number,
): Promise<SessionResult> {
  if (!CONTRACT_ID) {
    console.warn('Contract ID not configured. Score submission simulated.');
    return { sessionId, success: true };
  }

  try {
    await validateNetwork();
    
    if (typeof window !== 'undefined' && 'stellar' in window) {
      const result = await (window as any).stellar.request({
        method: 'invokeContract',
        params: {
          contractId: CONTRACT_ID,
          functionName: 'submit_score',
          args: [sessionId, score.toString()],
        },
      });
      return { sessionId, success: true, reward: result.reward };
    }
  } catch (error) {
    console.error('Failed to submit score:', error);
    return { sessionId, success: false, error: String(error) };
  }

  return { sessionId, success: false, error: 'Wallet not connected' };
}

export async function claimReward(sessionId: string): Promise<boolean> {
  if (!CONTRACT_ID) return false;

  try {
    await validateNetwork();
    
    if (typeof window !== 'undefined' && 'stellar' in window) {
      await (window as any).stellar.request({
        method: 'invokeContract',
        params: {
          contractId: CONTRACT_ID,
          functionName: 'claim_reward',
          args: [sessionId],
        },
      });
      return true;
    }
  } catch (error) {
    console.error('Failed to claim reward:', error);
  }

  return false;
}

export async function getLeaderboard(): Promise<{ address: string; score: number }[]> {
  if (!CONTRACT_ID) return [];

  try {
    await validateNetwork();
    
    if (typeof window !== 'undefined' && 'stellar' in window) {
      const result = await (window as any).stellar.request({
        method: 'invokeContract',
        params: {
          contractId: CONTRACT_ID,
          functionName: 'get_leaderboard',
          args: [],
        },
      });
      return result.leaderboard as { address: string; score: number }[];
    }
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
  }

  return [];
}
