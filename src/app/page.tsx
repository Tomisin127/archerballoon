'use client'
import type React from 'react';
import { useEffect, useState } from 'react';
import { GameCanvas } from '@/components/GameCanvas';
import { GameHUD } from '@/components/GameHUD';
import { GameControls } from '@/components/GameControls';
import { WalletButton } from '@/components/WalletButton';
import { TokenClaim } from '@/components/TokenClaim';
import { SwapModal } from '@/components/SwapModal';
import { HomeScreen } from '@/components/HomeScreen';
import { sdk } from "@farcaster/miniapp-sdk";
import { useAddMiniApp } from "@/hooks/useAddMiniApp";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import { useIsInFarcaster } from "@/hooks/useIsInFarcaster";

export default function BowAndArrowGame(): React.ReactElement {
  const { addMiniApp } = useAddMiniApp();
  const isInFarcaster = useIsInFarcaster();
  useQuickAuth(isInFarcaster);

  const [score, setScore] = useState<number>(0);
  const [wave, setWave] = useState<number>(1);
  const [arrows, setArrows] = useState<number>(5);
  const [combo, setCombo] = useState<number>(0);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover' | 'ready'>('menu');
  const [showTokenClaim, setShowTokenClaim] = useState<boolean>(false);
  const [showSwapModal, setShowSwapModal] = useState<boolean>(false);

  useEffect(() => {
    const tryAddMiniApp = async () => {
      try {
        await addMiniApp();
      } catch (error) {
        console.error('Failed to add mini app:', error);
      }
    };
    tryAddMiniApp();
  }, [addMiniApp]);

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (document.readyState !== 'complete') {
          await new Promise<void>(resolve => {
            if (document.readyState === 'complete') {
              resolve();
            } else {
              window.addEventListener('load', () => resolve(), { once: true });
            }
          });
        }
        await sdk.actions.ready();
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
        setTimeout(async () => {
          try {
            await sdk.actions.ready();
          } catch (retryError) {
            console.error('Farcaster SDK retry failed:', retryError);
          }
        }, 1000);
      }
    };
    initializeFarcaster();
  }, []);

  // Show token claim modal when game is over
  useEffect(() => {
    if (gameState === 'gameover') {
      setShowTokenClaim(true);
    }
  }, [gameState]);

  const handleCloseTokenClaim = (): void => {
    setShowTokenClaim(false);
    setGameState('menu');
    setScore(0);
    setWave(1);
    setArrows(5);
    setCombo(0);
  };

  const handleStartGame = (): void => {
    setScore(0);
    setWave(1);
    setArrows(5);
    setCombo(0);
    setGameState('ready');
  };

  const handleBackToMenu = (): void => {
    setGameState('menu');
    setScore(0);
    setWave(1);
    setArrows(5);
    setCombo(0);
  };

  // Show home screen when in menu state
  if (gameState === 'menu') {
    return (
      <HomeScreen 
        onStartGame={handleStartGame}
        onOpenSwap={() => setShowSwapModal(true)}
        showSwapModal={showSwapModal}
        onCloseSwap={() => setShowSwapModal(false)}
      />
    );
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Wallet Button */}
      <WalletButton />
      
      {/* Game HUD */}
      <GameHUD 
        score={score}
        wave={wave}
        arrows={arrows}
        combo={combo}
        gameState={gameState}
        onBackToMenu={handleBackToMenu}
        onOpenSwap={() => setShowSwapModal(true)}
      />
      
      {/* Game Canvas */}
      <GameCanvas
        score={score}
        setScore={setScore}
        wave={wave}
        setWave={setWave}
        arrows={arrows}
        setArrows={setArrows}
        combo={combo}
        setCombo={setCombo}
        gameState={gameState}
        setGameState={setGameState}
      />

      {/* Controls Overlay */}
      <GameControls />

      {/* Token Claim Modal */}
      {showTokenClaim && (
        <TokenClaim 
          score={score} 
          onClose={handleCloseTokenClaim}
        />
      )}

      {/* Swap Modal */}
      {showSwapModal && (
        <SwapModal onClose={() => setShowSwapModal(false)} />
      )}
    </main>
  );
}
