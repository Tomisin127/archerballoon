'use client';

import type React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeftRight, Target, Zap } from 'lucide-react';

interface GameHUDProps {
  score: number;
  wave: number;
  arrows: number;
  combo: number;
  gameState: 'menu' | 'playing' | 'gameover' | 'ready';
  onBackToMenu: () => void;
  onOpenSwap: () => void;
}

export function GameHUD({ 
  score, 
  wave, 
  arrows, 
  combo, 
  gameState,
  onBackToMenu,
  onOpenSwap
}: GameHUDProps): React.ReactElement {
  return (
    <>
      {/* Top Left - Score */}
      <div className="fixed top-4 left-4 z-10">
        <Card className="game-card px-4 py-2 min-w-[100px]">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-400" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Score</div>
              <div className="text-2xl font-bold text-white tabular-nums">{Math.floor(score)}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Center - Combo (only when active) */}
      {combo > 0 && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Card className="bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2 shadow-lg shadow-orange-500/30 animate-pulse border-0">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-white fill-amber-300" />
              <div className="text-center">
                <div className="text-[10px] text-white/80 uppercase tracking-wider">Combo</div>
                <div className="text-2xl font-bold text-white">{combo}x</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Right Side Stats */}
      <div className="fixed top-24 right-4 z-10 flex flex-col gap-2">
        {/* Wave */}
        <Card className="game-card px-3 py-2 text-center min-w-[70px]">
          <div className="text-[9px] text-slate-500 uppercase tracking-wider">Wave</div>
          <div className="text-xl font-bold text-emerald-400">{wave}</div>
        </Card>

        {/* Arrows */}
        <Card className="game-card px-3 py-2 text-center min-w-[70px]">
          <div className="text-[9px] text-slate-500 uppercase tracking-wider">Arrows</div>
          <div className={`text-xl font-bold ${arrows <= 2 ? 'text-rose-400' : 'text-amber-400'}`}>
            {arrows}
          </div>
        </Card>
      </div>

      {/* Bottom Left - Game Controls */}
      <div className="fixed bottom-6 left-4 z-50 flex flex-col gap-2">
        {/* Back to Menu Button */}
        <Button
          onClick={onBackToMenu}
          size="sm"
          className="game-button-primary w-12 h-12 rounded-full p-0 shadow-lg"
          title="Back to Menu"
        >
          <Home className="w-5 h-5" />
        </Button>
      </div>

      {/* Bottom Right - Swap Button */}
      <div className="fixed bottom-6 right-4 z-50">
        <Button
          onClick={onOpenSwap}
          size="sm"
          className="game-button-secondary px-4 py-3 h-auto flex items-center gap-2 shadow-lg"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span className="text-sm font-bold">Swap</span>
        </Button>
      </div>
    </>
  );
}
