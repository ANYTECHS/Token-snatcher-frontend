import * as Phaser from 'phaser';
import { GameScene } from '@/game/scenes/GameScene';
import { ResultScene } from '@/game/scenes/ResultScene';
import { GAME_WIDTH, GAME_HEIGHT } from '@/utils/constants';

export type GameMode = 'ranked' | 'free';

export interface CreatePhaserGameParams {
    parent: HTMLElement;
    mode: GameMode;
    onScoreUpdate?: (score: number, combo: number) => void;
    onGameOver?: (finalScore: number) => void;
}

/**
 * Creates and boots a Phaser game instance inside the given parent element.
 * Must only be called client-side.
 */
export function createPhaserGame({ parent, mode, onScoreUpdate, onGameOver }: CreatePhaserGameParams) {
    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        parent,
        backgroundColor: '#0f172a',
        scene: [GameScene, ResultScene],
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
    };

    const game = new Phaser.Game(config);

    // Deterministically start the main scene as soon as Phaser is ready.
    game.events.once('ready', () => {
        game.scene.start('GameScene', {
            mode,
            onScoreUpdate,
            onGameOver,
        });
    });

    return game;
}

