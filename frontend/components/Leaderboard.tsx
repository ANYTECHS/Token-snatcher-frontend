interface LeaderboardEntry {
  rank: number;
  address: string;
  score: number;
}

const mockData: LeaderboardEntry[] = [
  { rank: 1, address: 'GABC…1234', score: 5420 },
  { rank: 2, address: 'GDEF…5678', score: 4890 },
  { rank: 3, address: 'GHIJ…9012', score: 3750 },
  { rank: 4, address: 'GKLM…3456', score: 3210 },
  { rank: 5, address: 'GNOP…7890', score: 2980 },
];

export default function Leaderboard() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#334155]">
        <span className="text-sm font-mono text-[#94a3b8] w-12">Rank</span>
        <span className="text-sm font-mono text-[#94a3b8] flex-1">Player</span>
        <span className="text-sm font-mono text-[#94a3b8] w-24 text-right">Score</span>
      </div>

      {mockData.map((entry) => (
        <div
          key={entry.rank}
          className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b] hover:bg-[#1e293b] transition-colors"
        >
          <span className="text-sm font-mono text-white w-12">
            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
          </span>
          <span className="text-sm font-mono text-[#e2e8f0] flex-1">{entry.address}</span>
          <span className="text-sm font-mono text-[#f59e0b] w-24 text-right">
            {entry.score.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
