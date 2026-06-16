import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/utils/constants';

interface ResultData {
  score: number;
  mode: 'ranked' | 'free';
}

export class ResultScene extends Phaser.Scene {
  private score = 0;
  private mode: 'ranked' | 'free' = 'free';

  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data: ResultData): void {
    this.score = data.score ?? 0;
    this.mode = data.mode ?? 'free';
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0f172a');

    const centerX = GAME_WIDTH / 2;

    this.add.text(centerX, 120, 'Game Over', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    const modeLabel = this.mode === 'ranked' ? 'Ranked' : 'Free Play';
    this.add.text(centerX, 180, `Mode: ${modeLabel}`, {
      fontSize: '20px',
      color: '#94a3b8',
      fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5);

    const scoreText = this.add.text(centerX, 260, `${this.score}`, {
      fontSize: '72px',
      color: '#f59e0b',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: scoreText,
      scale: { from: 0.5, to: 1 },
      duration: 500,
      ease: 'Back.easeOut',
    });

    this.add.text(centerX, 310, 'points', {
      fontSize: '18px',
      color: '#94a3b8',
      fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5);

    const playAgainBtn = this.createButton(centerX, 420, 'Play Again', () => {
      this.restartGame();
    });

    this.tweens.add({
      targets: playAgainBtn,
      alpha: { from: 0, to: 1 },
      duration: 300,
      delay: 600,
    });

    const homeBtn = this.createButton(centerX, 490, 'Main Menu', () => {
      this.scene.start('GameScene', { mode: this.mode });
      this.scene.stop('ResultScene');
      window.location.href = '/';
    });

    this.tweens.add({
      targets: homeBtn,
      alpha: { from: 0, to: 1 },
      duration: 300,
      delay: 800,
    });
  }

  private createButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Container {
    const width = 220;
    const height = 50;

    const bg = this.add.rectangle(0, 0, width, height, 0x3b82f6, 1);
    bg.setStrokeStyle(2, 0x60a5fa);

    const text = this.add.text(0, 0, label, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    const container = this.add.container(x, y, [bg, text]);
    container.setSize(width, height);
    container.setInteractive({ cursor: 'pointer' });

    container.on('pointerover', () => {
      bg.setFillStyle(0x2563eb);
      bg.setScale(1.05);
      text.setScale(1.05);
    });

    container.on('pointerout', () => {
      bg.setFillStyle(0x3b82f6);
      bg.setScale(1);
      text.setScale(1);
    });

    container.on('pointerdown', onClick);

    return container;
  }

  private restartGame(): void {
    this.scene.stop('ResultScene');
    this.scene.start('GameScene', {
      mode: this.mode,
      onScoreUpdate: undefined,
      onGameOver: undefined,
    });
  }
}
