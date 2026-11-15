'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  globalScoreTracker,
  ScoreSessionSnapshot,
} from '@/services/score.service';

export interface ScoreContextValue extends ScoreSessionSnapshot {
  recordSnatch: (basePoints: number, now?: number) => number;
  syncScore: (score: number, combo: number, now?: number) => void;
  resetSessionScore: () => void;
}

const ScoreContext = createContext<ScoreContextValue | undefined>(undefined);

export function ScoreProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<ScoreSessionSnapshot>(() =>
    globalScoreTracker.getSnapshot(),
  );

  useEffect(() => {
    return globalScoreTracker.subscribe((next) => {
      setSnapshot(next);
    });
  }, []);

  const recordSnatch = useCallback((basePoints: number, now?: number) => {
    const { earnedPoints } = globalScoreTracker.recordSnatch(basePoints, now);
    return earnedPoints;
  }, []);

  const syncScore = useCallback((score: number, combo: number, now?: number) => {
    globalScoreTracker.syncState(score, combo, now);
  }, []);

  const resetSessionScore = useCallback(() => {
    globalScoreTracker.resetSession();
  }, []);

  return (
    <ScoreContext.Provider
      value={{
        ...snapshot,
        recordSnatch,
        syncScore,
        resetSessionScore,
      }}
    >
      {children}
    </ScoreContext.Provider>
  );
}

export function useScore(): ScoreContextValue {
  const context = useContext(ScoreContext);
  if (!context) {
    throw new Error('useScore must be used within a ScoreProvider');
  }
  return context;
}
