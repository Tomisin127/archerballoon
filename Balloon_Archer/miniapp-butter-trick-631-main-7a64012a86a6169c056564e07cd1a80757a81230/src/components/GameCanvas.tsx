'use client';

import type React from 'react';
import { useEffect, useRef } from 'react';
import type { Arrow, Balloon, Particle } from '@/types/game';
import { createBalloons, updateArrows, updateBalloons, updateParticles, checkCollisions, drawGame } from '@/lib/gameEngine';
import { soundEngine } from '@/lib/soundEngine';

interface GameCanvasProps {
  score: number;
  setScore: (value: number | ((prev: number) => number)) => void;
  wave: number;
  setWave: (value: number | ((prev: number) => number)) => void;
  arrows: number;
  setArrows: (value: number | ((prev: number) => number)) => void;
  combo: number;
  setCombo: (value: number | ((prev: number) => number)) => void;
  gameState: 'menu' | 'playing' | 'gameover' | 'ready';
  setGameState: (value: 'menu' | 'playing' | 'gameover' | 'ready') => void;
}

export function GameCanvas({
  score,
  setScore,
  wave,
  setWave,
  arrows,
  setArrows,
  combo,
  setCombo,
  gameState,
  setGameState
}: GameCanvasProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arrowsRef = useRef<Arrow[]>([]);
  const balloonsRef = useRef<Balloon[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const aimingRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const currentPosRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Reset game when returning to 'ready' state
  useEffect(() => {
    if (gameState === 'ready') {
      // Clear all game objects
      arrowsRef.current = [];
      balloonsRef.current = [];
      particlesRef.current = [];
      aimingRef.current = false;
      startPosRef.current = null;
      currentPosRef.current = null;
    }
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Initialize balloons when canvas is ready
      if (balloonsRef.current.length === 0 && gameState === 'ready') {
        balloonsRef.current = createBalloons(wave, canvas.width, canvas.height);
        setGameState('playing');
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [wave, gameState, setGameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (): void => {
      // Update
      updateArrows(arrowsRef.current, canvas.width, canvas.height);
      updateBalloons(balloonsRef.current);
      updateParticles(particlesRef.current);

      // Check collisions
      const { poppedBalloons, hitArrows } = checkCollisions(
        arrowsRef.current,
        balloonsRef.current,
        particlesRef.current
      );

      // Handle scoring
      if (poppedBalloons > 0) {
        soundEngine.playPop();
        const newCombo = combo + poppedBalloons;
        setCombo(newCombo);
        if (newCombo >= 3) {
          soundEngine.playCombo(newCombo);
        }
        const multiplier = 1 + (newCombo * 0.1);
        setScore((prev: number) => prev + (100 * poppedBalloons * multiplier));
      }

      // Reset combo if arrow missed
      if (hitArrows === 0 && arrowsRef.current.length === 0 && !aimingRef.current) {
        if (combo > 0) {
          setCombo(0);
        }
      }

      // Draw
      drawGame(
        ctx,
        canvas.width,
        canvas.height,
        arrowsRef.current,
        balloonsRef.current,
        particlesRef.current,
        aimingRef.current,
        startPosRef.current,
        currentPosRef.current,
        combo
      );

      // Check win/lose conditions
      if (balloonsRef.current.length === 0 && gameState === 'playing') {
        // Wave complete
        soundEngine.playWaveComplete();
        const newWave = wave + 1;
        setWave(newWave);
        setArrows(5);
        balloonsRef.current = createBalloons(newWave, canvas.width, canvas.height);
      }

      if (arrows === 0 && arrowsRef.current.length === 0 && balloonsRef.current.length > 0 && gameState === 'playing') {
        soundEngine.playGameOver();
        setGameState('gameover');
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [arrows, combo, gameState, score, setArrows, setCombo, setGameState, setScore, setWave, wave]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerDown = (e: PointerEvent): void => {
      if (gameState !== 'playing' || arrows === 0) return;

      const rect = canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;

      // Only allow aiming from bottom 50% of screen
      if (y > canvas.height * 0.5) {
        aimingRef.current = true;
        startPosRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        currentPosRef.current = { ...startPosRef.current };
      }
    };

    const handlePointerMove = (e: PointerEvent): void => {
      if (!aimingRef.current || !startPosRef.current) return;

      const rect = canvas.getBoundingClientRect();
      currentPosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handlePointerUp = (e: PointerEvent): void => {
      if (!aimingRef.current || !startPosRef.current || !currentPosRef.current) return;

      const dx = currentPosRef.current.x - startPosRef.current.x;
      const dy = currentPosRef.current.y - startPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Deadzone check
      if (distance > 15 && arrows > 0) {
        const angle = Math.atan2(-dy, -dx);
        const power = Math.min(distance / 250, 1.0);

        const velocityX = Math.cos(angle) * (10 + power * 20);
        const velocityY = Math.sin(angle) * (10 + power * 20);

        soundEngine.playShoot();
        
        arrowsRef.current.push({
          x: canvas.width / 2,
          y: canvas.height - 100,
          vx: velocityX,
          vy: velocityY,
          rotation: angle,
          active: true
        });

        setArrows((prev: number) => prev - 1);
      }

      aimingRef.current = false;
      startPosRef.current = null;
      currentPosRef.current = null;
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [arrows, gameState, setArrows]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 touch-none"
      style={{ touchAction: 'none' }}
    />
  );
}
