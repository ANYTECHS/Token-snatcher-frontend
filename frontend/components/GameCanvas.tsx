'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createPhaserGame } from '@/game/phaser/createPhaserGame';

import { GAME_WIDTH, GAME_HEIGHT } from '@/utils/constants';

interface GameCanvasProps {

  mode: 'ranked' | 'free';
  onScoreUpdate?: (score: number, combo: number) => void;
  onGameOver?: (finalScore: number) => void;
}

export default function GameCanvas({ mode, onScoreUpdate, onGameOver }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<ReturnType<typeof createPhaserGame> | null>(null);
  const didInitRef = useRef(false);




  const handleGameOver = useCallback(

    (finalScore: number) => {
      onGameOver?.(finalScore);
    },
    [onGameOver],
  );

  const handleScoreUpdate = useCallback(
    (score: number, combo: number) => {
      onScoreUpdate?.(score, combo);
    },
    [onScoreUpdate],
  );

  useEffect(() => {
    if (!containerRef.current || didInitRef.current || gameRef.current) return;
    didInitRef.current = true;


    const phaserGame = createPhaserGame({
      parent: containerRef.current,
      mode,
      onScoreUpdate: handleScoreUpdate,
      onGameOver: handleGameOver,
    });

    gameRef.current = phaserGame;


    return () => {
      phaserGame.destroy(true);
      gameRef.current = null;
    };
  }, [mode, handleScoreUpdate, handleGameOver]);

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden border border-[#334155] shadow-lg"
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT, maxWidth: '100%' }}
    />
  );
}
