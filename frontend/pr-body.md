## Description

Allows players to restart a completed game session. When a game ends (timer runs out in ranked mode, or player finishes in free play), the result screen displays the final score with a **"Play Again"** button. Clicking it immediately resets all game state (score, combo, tokens, timer) and starts a fresh session.

## Acceptance Criteria

- **State resets correctly** — score, combo counter, active tokens, timer, and occupied positions all return to initial values
- **New session starts immediately** — no page reload or extra clicks needed; the game canvas re-mounts with a fresh GameScene
- **Works in both modes** — Free Play (no timer) and Ranked Mode (60s countdown)

## Changes

### New files

| File | Purpose |
|------|---------|
| `game/scenes/GameScene.ts` | Main Phaser scene — token spawning, snatching, combo scoring, timer, difficulty progression |
| `game/scenes/ResultScene.ts` | Game-over scene — animated score display, "Play Again" and "Main Menu" buttons |
| `utils/scoring.ts` | Score state management, combo multiplier calculations |
| `utils/spawnLogic.ts` | Grid-based spawn point generation, token type selection, position occupancy tracking |
| `utils/constants.ts` | All game tunables — canvas size, token config, timing, difficulty params |
| `components/GameCanvas.tsx` | React wrapper that initialises/destroys the Phaser game instance (client-only via dynamic import) |
| `components/ScoreBoard.tsx` | Displays live score and combo multiplier during gameplay |
| `components/WalletButton.tsx` | Freighter wallet connect/disconnect button |
| `components/Leaderboard.tsx` | Mock leaderboard with ranked entries |
| `services/wallet.service.ts` | Wallet connection and address retrieval |
| `services/contract.service.ts` | Soroban smart contract interaction stubs (start_session, submit_score, claim_reward, get_leaderboard) |
| `services/api.service.ts` | Backend API client stub for leaderboard and score submission |
| `app/free/page.tsx` | Free Play page — no timer, score tracking, game-over overlay with restart |
| `app/ranked/page.tsx` | Ranked Mode page — 60s timer, score tracking, game-over overlay with restart |
| `app/leaderboard/page.tsx` | Leaderboard page |

### Modified files

| File | Change |
|------|--------|
| `app/layout.tsx` | Replaced Google Fonts with system fonts, added nav bar with links to all pages + WalletButton |
| `app/page.tsx` | Landing page with mode selection cards |
| `app/globals.css` | Simplified to just Tailwind import |
| `next.config.ts` | Added `turbopack.root` to silence workspace-detection warning |
| `package.json` | Added `phaser@3.80.1` dependency |
| `package-lock.json` | Updated with new dependencies |

## Screenshots

<!-- Add screenshots here if available -->

## How to test

1. `cd frontend && npm install && npm run dev`
2. Open http://localhost:3000
3. Click **Free Play** or **Ranked Mode**
4. Snatch tokens by clicking them
5. Wait for timer to expire (Ranked) or click tokens until done
6. Click **Play Again** on the game-over screen
7. Verify score resets to 0, no lingering tokens, timer restarts

## Technical details

- **Game engine:** Phaser 3.80 with AUTO renderer, FIT scaling
- **Token system:** 3 types (blue 10pts, gold 25pts, red 50pts) with weighted random spawns on a 5x4 grid
- **Combo system:** Snatching within 2s increments multiplier (x1 to x1.5 to x2 to ... to x5 max)
- **Difficulty scaling:** Every 15s, spawn interval decreases (min 300ms)
- **Restart mechanism:** React state reset via `gameKey` increment forces Phaser instance to remount; `GameScene.init()` calls `resetState()` which clears all tracked state
- **SSR safety:** `GameCanvas` uses `dynamic(() => import(...), { ssr: false })` to avoid Phaser's browser API usage during server rendering

## Checklist

- [x] TypeScript compiles with no errors
- [x] Next.js build succeeds (all 5 routes)
- [x] State resets correctly on restart
- [x] New session starts immediately
- [x] Free Play and Ranked modes both supported
- [x] Wallet connection stub included
- [x] Smart contract interaction stubs included

## Related Issues

Closes #29
