import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold font-mono mb-4">
          Token Snatcher
        </h1>
        <p className="text-lg text-[#94a3b8] mb-2 font-mono">
          Snatch tokens before they disappear. Earn real on-chain rewards.
        </p>
        <p className="text-sm text-[#64748b] mb-10 font-mono">
          A decentralized whack-to-earn arcade game
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/free"
            className="px-8 py-4 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white font-bold rounded-xl hover:from-[#2563eb] hover:to-[#7c3aed] transition-all text-lg font-mono"
          >
            Free Play
          </Link>
          <Link
            href="/ranked"
            className="px-8 py-4 bg-gradient-to-r from-[#f59e0b] to-[#ef4444] text-white font-bold rounded-xl hover:from-[#d97706] hover:to-[#dc2626] transition-all text-lg font-mono"
          >
            Ranked Mode
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
            <div className="text-2xl mb-2">🎮</div>
            <h3 className="font-bold font-mono mb-2">Play</h3>
            <p className="text-sm text-[#94a3b8] font-mono">
              Snatch tokens as they appear on screen. Chain combos for bonus points.
            </p>
          </div>
          <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
            <div className="text-2xl mb-2">⛓️</div>
            <h3 className="font-bold font-mono mb-2">Earn</h3>
            <p className="text-sm text-[#94a3b8] font-mono">
              Submit your score on-chain. Smart contract validates & distributes rewards.
            </p>
          </div>
          <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-bold font-mono mb-2">Compete</h3>
            <p className="text-sm text-[#94a3b8] font-mono">
              Climb the global leaderboard. Unlock NFT multipliers for higher earnings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
