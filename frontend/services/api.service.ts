const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
}

export async function submitScoreToBackend(
  sessionId: string,
  score: number,
  address: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/game/submit-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, score, address }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to submit score to backend:', error);
    return false;
  }
}
