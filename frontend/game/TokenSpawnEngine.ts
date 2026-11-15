import * as Phaser from 'phaser';
import {
  SPAWN_INTERVAL_MS,
  INITIAL_SPAWN_DELAY_MS,
  MAX_TOKENS_ON_SCREEN,
  DIFFICULTY_INTERVAL_SECONDS,
  DIFFICULTY_SPAWN_REDUCTION,
  MIN_SPAWN_INTERVAL_MS,
  TokenType,
} from '@/utils/constants';
import {
  SpawnPoint,
  generateGridSpawnPoints,
  pickRandomTokenType,
  selectSpawnPositions,
  positionKey,
  createSeededRng,
} from '@/utils/spawnLogic';
import {
  DifficultyProgressionConfig,
  DifficultySnapshot,
  calculateNextSpawnInterval,
  getDifficultySnapshot,
  resolveDifficultyConfig,
} from '@/utils/difficulty';

export interface SpawnConfig {
  /** Base interval between spawns in ms. Default: SPAWN_INTERVAL_MS */
  spawnIntervalMs?: number;
  /** Delay before first spawn. Default: INITIAL_SPAWN_DELAY_MS */
  initialDelayMs?: number;
  /** Max simultaneous tokens on screen. Default: MAX_TOKENS_ON_SCREEN */
  maxTokens?: number;
  /** Enable automatic difficulty scaling. Default: true */
  difficultyScaling?: boolean;
  /** Configurable difficulty progression parameters. */
  difficultyConfig?: DifficultyProgressionConfig;
  /** Optional callback fired whenever difficulty scales up. */
  onDifficultyChange?: (snapshot: DifficultySnapshot) => void;
  /** Seed for deterministic randomness (ranked mode). Omit for free mode. */
  seed?: number;
}

export interface SpawnEvent {
  position: SpawnPoint;
  type: TokenType;
}

type SpawnCallback = (events: SpawnEvent[]) => void;

/**
 * TokenSpawnEngine
 *
 * Manages when and where tokens appear.
 * Decoupled from rendering — calls the provided callback with spawn events,
 * leaving visual creation to the caller (e.g. GameScene).
 */
export class TokenSpawnEngine {
  private scene: Phaser.Scene;
  private config: Required<Omit<SpawnConfig, 'difficultyConfig' | 'onDifficultyChange'>>;
  private difficultyConfig: Required<DifficultyProgressionConfig>;
  private onDifficultyChange?: (snapshot: DifficultySnapshot) => void;
  private rng: () => number;
  private spawnPoints: SpawnPoint[];
  private occupiedPositions: Set<string> = new Set();
  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  private difficultyTimer: Phaser.Time.TimerEvent | null = null;
  private currentInterval: number;
  private difficultyLevel = 0;
  private startedAtMs = 0;
  private onSpawn: SpawnCallback;
  private active = false;

  constructor(scene: Phaser.Scene, onSpawn: SpawnCallback, config: SpawnConfig = {}) {
    this.scene = scene;
    this.onSpawn = onSpawn;
    const baseSpawnInterval = config.spawnIntervalMs ?? SPAWN_INTERVAL_MS;
    this.config = {
      spawnIntervalMs: baseSpawnInterval,
      initialDelayMs: config.initialDelayMs ?? INITIAL_SPAWN_DELAY_MS,
      maxTokens: config.maxTokens ?? MAX_TOKENS_ON_SCREEN,
      difficultyScaling: config.difficultyScaling ?? true,
      seed: config.seed ?? 0,
    };
    this.difficultyConfig = resolveDifficultyConfig({
      baseSpawnIntervalMs: baseSpawnInterval,
      minSpawnIntervalMs: MIN_SPAWN_INTERVAL_MS,
      stepIntervalSeconds: DIFFICULTY_INTERVAL_SECONDS,
      spawnReductionPerStepMs: DIFFICULTY_SPAWN_REDUCTION,
      ...config.difficultyConfig,
    });
    this.onDifficultyChange = config.onDifficultyChange;
    this.currentInterval = this.difficultyConfig.baseSpawnIntervalMs;
    this.rng = config.seed !== undefined ? createSeededRng(config.seed) : Math.random;
    this.spawnPoints = generateGridSpawnPoints();
  }

  start(): void {
    this.active = true;
    this.difficultyLevel = 0;
    this.startedAtMs = Date.now();
    this.currentInterval = this.difficultyConfig.baseSpawnIntervalMs;

    this.spawnTimer = this.scene.time.addEvent({
      delay: this.config.initialDelayMs,
      callback: this.tick,
      callbackScope: this,
      loop: true,
    });

    if (this.config.difficultyScaling) {
      this.difficultyTimer = this.scene.time.addEvent({
        delay: this.difficultyConfig.stepIntervalSeconds * 1000,
        callback: this.increaseDifficulty,
        callbackScope: this,
        loop: true,
      });
    }
  }

  stop(): void {
    this.active = false;
    this.spawnTimer?.destroy();
    this.difficultyTimer?.destroy();
    this.spawnTimer = null;
    this.difficultyTimer = null;
  }

  /** Call when a token is placed so its position is marked occupied. */
  markOccupied(x: number, y: number): void {
    this.occupiedPositions.add(positionKey(x, y));
  }

  /** Call when a token is removed to free its position. */
  markFree(x: number, y: number): void {
    this.occupiedPositions.delete(positionKey(x, y));
  }

  /** Current number of occupied positions (= live tokens). */
  get tokenCount(): number {
    return this.occupiedPositions.size;
  }

  /** Current spawn interval in ms (decreases gradually as difficulty rises). */
  get spawnIntervalMs(): number {
    return this.currentInterval;
  }

  /** Current difficulty progression snapshot. */
  getDifficultySnapshot(): DifficultySnapshot {
    const elapsedSeconds =
      this.startedAtMs > 0 ? Math.floor((Date.now() - this.startedAtMs) / 1000) : 0;
    return getDifficultySnapshot(
      this.currentInterval,
      this.difficultyLevel,
      elapsedSeconds,
      this.difficultyConfig,
    );
  }

  /** Updates difficulty progression config at runtime without sudden spikes. */
  updateDifficultyConfig(newConfig: DifficultyProgressionConfig): void {
    this.difficultyConfig = resolveDifficultyConfig({
      ...this.difficultyConfig,
      ...newConfig,
    });
    this.currentInterval = Math.max(
      this.difficultyConfig.minSpawnIntervalMs,
      Math.min(this.difficultyConfig.baseSpawnIntervalMs, this.currentInterval),
    );
  }

  private tick(): void {
    if (!this.active) return;
    if (this.occupiedPositions.size >= this.config.maxTokens) return;

    const slots = this.config.maxTokens - this.occupiedPositions.size;
    const positions = selectSpawnPositions(
      this.occupiedPositions,
      this.spawnPoints,
      slots,
      this.rng,
    );

    const events: SpawnEvent[] = positions.map((pos) => ({
      position: pos,
      type: pickRandomTokenType(this.rng),
    }));

    if (events.length > 0) this.onSpawn(events);
  }

  private increaseDifficulty(): void {
    if (!this.active) return;
    const previousInterval = this.currentInterval;
    this.currentInterval = calculateNextSpawnInterval(
      this.currentInterval,
      this.difficultyConfig,
    );
    this.difficultyLevel += 1;

    if (this.currentInterval !== previousInterval) {
      this.spawnTimer?.destroy();
      this.spawnTimer = this.scene.time.addEvent({
        delay: this.currentInterval,
        callback: this.tick,
        callbackScope: this,
        loop: true,
      });
    }

    this.onDifficultyChange?.(this.getDifficultySnapshot());
  }
}
