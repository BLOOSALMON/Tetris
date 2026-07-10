import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../scenes/game-scene';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../config/render';

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      transparent: true,
      parent: containerRef.current,
      scene: [GameScene],
      fps: { target: 60 },
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="game-canvas" />;
}
