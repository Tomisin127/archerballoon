'use client';

import type React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeftRight, Target, Zap, Flag, Crosshair } from 'lucide-react';

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
  gameState: _gameState,
  onBackToMenu,
  onOpenSwap,
}: GameHUDProps): React.ReactElement {
  return (
    <>
      {/* Top Left - Score */}
      <div className="fixed top-3 left-3 z-10">
        <Card className="game-card px-4 py-2.5 min-w-[120px] border-orange-500/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl tile-gradient-orange flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Score</div>
              <div className="text-xl font-black text-white tabular-nums leading-tight">
                {Math.floor(score).toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Center - Combo (only when active) */}
      {combo > 0 && (
        <div className="fixed top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Card
            className={`relative border-0 px-4 py-2.5 overflow-hidden shadow-xl ${
              combo >= 5
                ? 'bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400 shadow-rose-500/50'
                : 'bg-gradient-to-br from-orange-500 to-amber-400 shadow-orange-500/50'
            } animate-pulse-glow`}
          >
            <div className="absolute inset-0 border-t border-white/40 rounded-[inherit] pointer-events-none" />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-white fill-white drop-shadow" />
              <div className="text-center">
                <div className="text-[9px] text-white/90 uppercase tracking-widest font-bold">
                  Combo
                </div>
                <div className="text-xl font-black text-white leading-tight drop-shadow">
                  {combo}x
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Right Side Stats */}
      <div className="fixed top-[72px] right-3 z-10 flex flex-col gap-2">
        <Card className="game-card px-3 py-2 text-center min-w-[74px] border-emerald-500/30">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <Flag className="w-3 h-3 text-emerald-400" />
            <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
              Wave
            </div>
          </div>
          <div className="text-xl font-black game-text-gradient-emerald leading-tight">
            {wave}
          </div>
        </Card>

        <Card
          className={`game-card px-3 py-2 text-center min-w-[74px] ${
            arrows <= 2 ? 'border-rose-500/40' : 'border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <Crosshair className={`w-3 h-3 ${arrows <= 2 ? 'text-rose-400' : 'text-amber-400'}`} />
            <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
              Arrows
            </div>
          </div>
          <div
            className={`text-xl font-black leading-tight ${
              arrows <= 2 ? 'text-rose-400' : 'text-amber-400'
            }`}
          >
            {arrows}
          </div>
        </Card>
      </div>

      {/* Bottom Left - Back to Menu */}
      <div className="fixed bottom-5 left-3 z-50">
        <Button
          onClick={onBackToMenu}
          size="sm"
          className="game-button-primary w-12 h-12 rounded-full p-0"
          title="Back to Menu"
          aria-label="Back to Menu"
        >
          <Home className="w-5 h-5" />
        </Button>
      </div>

      {/* Bottom Right - Swap Button */}
      <div className="fixed bottom-5 right-3 z-50">
        <Button
          onClick={onOpenSwap}
          size="sm"
          className="game-button-secondary px-4 py-3 h-auto flex items-center gap-2"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span className="text-sm font-black tracking-wide">Swap</span>
        </Button>
      </div>
    </>
  );
}
