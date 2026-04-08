'use client'
import type React, { useEffect } from 'react';
import { useEffect, useRef, useState } from 'react';
import { GameCanvas } from '@/components/GameCanvas';
import { GameHUD } from '@/components/GameHUD';
import { GameControls } from '@/components/GameControls';
import { WalletButton } from '@/components/WalletButton';
import { TokenClaim } from '@/components/TokenClaim';
import { AppCoinSwap } from '@/components/AppCoinSwap';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
import { sdk } from "@farcaster/miniapp-sdk";
import { useAddMiniApp } from "@/hooks/useAddMiniApp";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import { useIsInFarcaster } from "@/hooks/useIsInFarcaster";

export default function BowAndArrowGame(): React.ReactElement {
    const { addMiniApp } = useAddMiniApp();
    const isInFarcaster = useIsInFarcaster()
    useQuickAuth(isInFarcaster)
    useEffect(() => {
      const tryAddMiniApp = async () => {
        try {
          await addMiniApp()
        } catch (error) {
          console.error('Failed to add mini app:', error)
        }

      }

    

      tryAddMiniApp()
    }, [addMiniApp])
    useEffect(() => {
      const initializeFarcaster = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 100))
          
          if (document.readyState !== 'complete') {
            await new Promise<void>(resolve => {
              if (document.readyState === 'complete') {
                resolve()
              } else {
                window.addEventListener('load', () => resolve(), { once: true })
              }

            })
          }

    

          await sdk.actions.ready()
          console.log('Farcaster SDK initialized successfully - app fully loaded')
        } catch (error) {
          console.error('Failed to initialize Farcaster SDK:', error)
          
          setTimeout(async () => {
            try {
              await sdk.actions.ready()
              console.log('Farcaster SDK initialized on retry')
            } catch (retryError) {
              console.error('Farcaster SDK retry failed:', retryError)
            }

          }, 1000)
        }

      }

    

      initializeFarcaster()
    }, [])
  const [score, setScore] = useState<number>(0);
  const [wave, setWave] = useState<number>(1);
  const [arrows, setArrows] = useState<number>(5);
  const [combo, setCombo] = useState<number>(0);
  const [gameState, setGameState] = useState<'playing' | 'gameover' | 'ready'>('ready');
  const [showTokenClaim, setShowTokenClaim] = useState<boolean>(false);
  const [showAppCoinSwap, setShowAppCoinSwap] = useState<boolean>(false);

  // Show token claim modal when game is over
  useEffect(() => {
    if (gameState === 'gameover') {
      setShowTokenClaim(true);
    }
  }, [gameState]);

  const handleCloseTokenClaim = (): void => {
    setShowTokenClaim(false);
    // Reset game state to ready
    setGameState('ready');
    setScore(0);
    setWave(1);
    setArrows(5);
    setCombo(0);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#1A2A33]">
      {/* Top Navigation Bar */}
      <div className="absolute top-4 right-4 z-50">
        <WalletButton />
      </div>

      {/* Bottom Right - AppCoin Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowAppCoinSwap(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-2xl rounded-full px-6 py-6"
        >
          <Coins className="w-5 h-5 mr-2" />
          AppCoin
        </Button>
      </div>
      
      <GameHUD 
        score={score}
        wave={wave}
        arrows={arrows}
        combo={combo}
        gameState={gameState}
      />
      
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

      <GameControls />

      {showTokenClaim && (
        <TokenClaim 
          score={score} 
          onClose={handleCloseTokenClaim}
        />
      )}

      {/* AppCoin Swap Modal */}
      {showAppCoinSwap && (
        <AppCoinSwap onClose={() => setShowAppCoinSwap(false)} />
      )}
    </main>
  );
}
