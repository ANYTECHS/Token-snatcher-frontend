import {
  ScoreState,
  createScoreState,
  addScore,
  resetScore,
  calculateMultiplier,
} from '@/utils/scoring';

export interface ScoreSessionSnapshot extends ScoreState {
  /** Multiplier corresponding to the current combo count. */
  multiplier: number;
  /** Highest combo reached during the active session. */
  maxCombo: number;
  /** Total tokens snatched during the active session. */
  tokensSnatched: number;
  /** Unique identifier for the current gameplay session. */
  sessionId: number;
}

export type ScoreListener = (snapshot: ScoreSessionSnapshot) => void;

/**
 * Centralized, globally accessible score tracking manager.
 * Ensures instant updates across Phaser scenes and React UI components,
 * and clean resets between gameplay sessions.
 */
export class ScoreTrackingService {
  private state: ScoreState = createScoreState();
  private maxCombo = 0;
  private tokensSnatched = 0;
  private sessionId = 1;
  private listeners: Set<ScoreListener> = new Set();

  /** Returns an immutable snapshot of the current session score state. */
  getSnapshot(): ScoreSessionSnapshot {
    return {
      ...this.state,
      multiplier: calculateMultiplier(this.state.combo),
      maxCombo: this.maxCombo,
      tokensSnatched: this.tokensSnatched,
      sessionId: this.sessionId,
    };
  }

  /** Instantly records points earned from a token snatch and notifies all subscribers. */
  recordSnatch(basePoints: number, now: number = Date.now()): {
    snapshot: ScoreSessionSnapshot;
    earnedPoints: number;
  } {
    const { state, earnedPoints } = addScore(this.state, basePoints, now);
    this.state = state;
    this.tokensSnatched += 1;
    if (this.state.combo > this.maxCombo) {
      this.maxCombo = this.state.combo;
    }
    const snapshot = this.getSnapshot();
    this.notify(snapshot);
    return { snapshot, earnedPoints };
  }

  /** Synchronizes external score state (e.g. from Phaser GameScene) into the global store. */
  syncState(score: number, combo: number, now: number = Date.now()): ScoreSessionSnapshot {
    this.state = {
      score: Math.max(0, score),
      combo: Math.max(0, combo),
      lastSnatchTime: now,
    };
    if (this.state.combo > this.maxCombo) {
      this.maxCombo = this.state.combo;
    }
    const snapshot = this.getSnapshot();
    this.notify(snapshot);
    return snapshot;
  }

  /** Resets score state cleanly when starting a new session. */
  resetSession(): ScoreSessionSnapshot {
    this.state = resetScore();
    this.maxCombo = 0;
    this.tokensSnatched = 0;
    this.sessionId += 1;
    const snapshot = this.getSnapshot();
    this.notify(snapshot);
    return snapshot;
  }

  /** Subscribes to instant score updates. Returns an unsubscribe function. */
  subscribe(listener: ScoreListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(snapshot: ScoreSessionSnapshot): void {
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

export const globalScoreTracker = new ScoreTrackingService();
