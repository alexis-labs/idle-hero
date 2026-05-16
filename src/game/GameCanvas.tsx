import { useEffect, useRef } from 'react';
import type { GameState } from '../types/game';
import { IdleHeroScene } from './ThreeScene';

export function GameCanvas({ state }: { state: GameState }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<IdleHeroScene | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new IdleHeroScene(canvasRef.current);
    sceneRef.current = scene;
    scene.start();

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.updateState(state);
  }, [state]);

  return <canvas ref={canvasRef} className="game-canvas" aria-hidden="true" />;
}
