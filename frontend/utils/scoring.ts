import { COMBO_MULTIPLIER_INCREMENT, MAX_COMBO_MULTIPLIER, COMBO_TIMEOUT_MS } from '@/utils/constants';

export interface ScoreState {
  score: number;
  combo: number;
  lastSnatchTime: number;
}

export function createScoreState(): ScoreState {
  return {
    score: 0,
    combo: 0,
    lastSnatchTime: 0,
  };
}

export function calculateCombo(state: ScoreState, now: number): number {
  if (state.lastSnatchTime && now - state.lastSnatchTime <= COMBO_TIMEOUT_MS) {
    return Math.min(state.combo + 1, Math.floor(MAX_COMBO_MULTIPLIER / COMBO_MULTIPLIER_INCREMENT));
  }
  return 0;
}

export function calculateMultiplier(combo: number): number {
  return 1 + combo * COMBO_MULTIPLIER_INCREMENT;
}

export function addScore(state: ScoreState, basePoints: number, now: number): ScoreState {
  const newCombo = calculateCombo(state, now);
  const multiplier = calculateMultiplier(newCombo);
  const earnedPoints = Math.round(basePoints * multiplier);

  return {
    score: state.score + earnedPoints,
    combo: newCombo,
    lastSnatchTime: now,
  };
}

export function resetScore(): ScoreState {
  return createScoreState();
}
