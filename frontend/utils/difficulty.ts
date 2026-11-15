import {
  SPAWN_INTERVAL_MS,
  DIFFICULTY_INTERVAL_SECONDS,
  DIFFICULTY_SPAWN_REDUCTION,
  MIN_SPAWN_INTERVAL_MS,
} from '@/utils/constants';

export interface DifficultyProgressionConfig {
  /** Base interval between spawns at the start of a session (ms). */
  baseSpawnIntervalMs?: number;
  /** Minimum allowed interval between spawns (ms). */
  minSpawnIntervalMs?: number;
  /** Seconds between difficulty progression steps. */
  stepIntervalSeconds?: number;
  /** Target reduction per step in ms. */
  spawnReductionPerStepMs?: number;
  /** Maximum percentage reduction allowed in a single step (prevents sudden spikes). Default: 0.12 (12%). */
  maxStepReductionRatio?: number;
  /** Smoothing factor (0..1) applied to transitions between steps. Default: 0.65. */
  smoothingFactor?: number;
}

export interface DifficultySnapshot {
  /** Number of difficulty steps elapsed. */
  level: number;
  /** Elapsed survival time in seconds. */
  elapsedSeconds: number;
  /** Current smoothed spawn interval in ms. */
  spawnIntervalMs: number;
  /** Normalized difficulty progress between 0 (initial) and 1 (max difficulty). */
  progress: number;
  /** Relative spawn speed multiplier compared to the base interval. */
  speedMultiplier: number;
}

export const DEFAULT_DIFFICULTY_CONFIG: Required<DifficultyProgressionConfig> = {
  baseSpawnIntervalMs: SPAWN_INTERVAL_MS,
  minSpawnIntervalMs: MIN_SPAWN_INTERVAL_MS,
  stepIntervalSeconds: DIFFICULTY_INTERVAL_SECONDS,
  spawnReductionPerStepMs: DIFFICULTY_SPAWN_REDUCTION,
  maxStepReductionRatio: 0.12,
  smoothingFactor: 0.65,
};

export function resolveDifficultyConfig(
  config: DifficultyProgressionConfig = {},
): Required<DifficultyProgressionConfig> {
  const baseSpawnIntervalMs = Math.max(
    100,
    config.baseSpawnIntervalMs ?? DEFAULT_DIFFICULTY_CONFIG.baseSpawnIntervalMs,
  );
  const minSpawnIntervalMs = Math.min(
    baseSpawnIntervalMs,
    Math.max(50, config.minSpawnIntervalMs ?? DEFAULT_DIFFICULTY_CONFIG.minSpawnIntervalMs),
  );
  const stepIntervalSeconds = Math.max(
    1,
    config.stepIntervalSeconds ?? DEFAULT_DIFFICULTY_CONFIG.stepIntervalSeconds,
  );
  const spawnReductionPerStepMs = Math.max(
    1,
    config.spawnReductionPerStepMs ?? DEFAULT_DIFFICULTY_CONFIG.spawnReductionPerStepMs,
  );
  const maxStepReductionRatio = Math.min(
    0.5,
    Math.max(0.01, config.maxStepReductionRatio ?? DEFAULT_DIFFICULTY_CONFIG.maxStepReductionRatio),
  );
  const smoothingFactor = Math.min(
    1,
    Math.max(0.1, config.smoothingFactor ?? DEFAULT_DIFFICULTY_CONFIG.smoothingFactor),
  );

  return {
    baseSpawnIntervalMs,
    minSpawnIntervalMs,
    stepIntervalSeconds,
    spawnReductionPerStepMs,
    maxStepReductionRatio,
    smoothingFactor,
  };
}

/**
 * Computes the next spawn interval smoothly while capping the single-step drop
 * so players never experience sudden difficulty spikes.
 */
export function calculateNextSpawnInterval(
  currentIntervalMs: number,
  config: DifficultyProgressionConfig = {},
): number {
  const resolved = resolveDifficultyConfig(config);
  if (currentIntervalMs <= resolved.minSpawnIntervalMs) {
    return resolved.minSpawnIntervalMs;
  }

  const rawReduction = resolved.spawnReductionPerStepMs * resolved.smoothingFactor;
  const maxAllowedReduction = Math.max(
    1,
    Math.floor(currentIntervalMs * resolved.maxStepReductionRatio),
  );
  const clampedReduction = Math.min(rawReduction, maxAllowedReduction);

  return Math.max(
    resolved.minSpawnIntervalMs,
    Math.round(currentIntervalMs - clampedReduction),
  );
}

/**
 * Computes a complete difficulty snapshot for a given survival duration or step count.
 */
export function getDifficultySnapshot(
  currentIntervalMs: number,
  level: number,
  elapsedSeconds: number,
  config: DifficultyProgressionConfig = {},
): DifficultySnapshot {
  const resolved = resolveDifficultyConfig(config);
  const clampedInterval = Math.min(
    resolved.baseSpawnIntervalMs,
    Math.max(resolved.minSpawnIntervalMs, currentIntervalMs),
  );
  const totalRange = resolved.baseSpawnIntervalMs - resolved.minSpawnIntervalMs;
  const progress =
    totalRange > 0
      ? Number(((resolved.baseSpawnIntervalMs - clampedInterval) / totalRange).toFixed(3))
      : 1;
  const speedMultiplier = Number(
    (resolved.baseSpawnIntervalMs / clampedInterval).toFixed(2),
  );

  return {
    level: Math.max(0, level),
    elapsedSeconds: Math.max(0, elapsedSeconds),
    spawnIntervalMs: clampedInterval,
    progress,
    speedMultiplier,
  };
}
