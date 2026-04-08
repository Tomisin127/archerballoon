'use client';

import type React from 'react';
import { Card } from '@/components/ui/card';

interface GameHUDProps {
  score: number;
  wave: number;
  arrows: number;
  combo: number;
  gameState: 'playing' | 'gameover' | 'ready';
}

export function GameHUD({ score, wave, arrows, combo, gameState }: GameHUDProps): React.ReactElement {
  return (
    <>
      {/* Top Left - Score (compact) */}
      <div className="fixed top-4 left-4 z-10">
        <Card className="bg-white/90 backdrop-blur-sm px-2 py-1 shadow-lg">
          <div className="text-[10px] text-gray-600">Score</div>
          <div className="text-lg font-bold text-black">{Math.floor(score)}</div>
        </Card>
      </div>

      {/* Top Right - Wave and Arrows (stacked, positioned lower and more to the right, smaller) */}
      <div className="fixed top-28 right-10 z-10 flex flex-col gap-1.5 md:top-32 md:right-14">
        <Card className="bg-white/90 backdrop-blur-sm px-2 py-1 shadow-lg text-center min-w-[65px]">
          <div className="text-[9px] text-gray-600">Wave</div>
          <div className="text-sm font-bold text-black">{wave}</div>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm px-2 py-1 shadow-lg text-center min-w-[65px]">
          <div className="text-[9px] text-gray-600">Arrows</div>
          <div className="text-sm font-bold text-black">{arrows}</div>
        </Card>
      </div>

      {/* Top Center - Combo (only when active, compact) */}
      {combo > 0 && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 px-2 py-1 shadow-lg animate-pulse">
            <div className="text-[10px] text-white/90">Combo</div>
            <div className="text-lg font-bold text-white">{combo}x</div>
          </Card>
        </div>
      )}
    </>
  );
}
