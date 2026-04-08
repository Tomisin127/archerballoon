'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { X, Move, Target, Hand } from 'lucide-react';

export function GameControls(): React.ReactElement {
  const [visible, setVisible] = useState<boolean>(true);
  const [minimized, setMinimized] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimized(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return <></>;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
      <Card className={`game-card text-white p-5 max-w-[280px] transition-all duration-300 ${minimized ? 'scale-90 opacity-70' : 'scale-100 opacity-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-orange-400 flex items-center gap-2">
            <Target className="w-4 h-4" />
            How to Play
          </h3>
          <button
            onClick={() => setVisible(false)}
            className="text-slate-500 hover:text-white text-sm pointer-events-auto p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {!minimized && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Hand className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Touch & Drag</p>
                <p className="text-slate-400 text-xs">Pull down to set power</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Move className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Aim Direction</p>
                <p className="text-slate-400 text-xs">Drag left/right to aim</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Release to Fire</p>
                <p className="text-slate-400 text-xs">Pop all the balloons!</p>
              </div>
            </div>
          </div>
        )}
        
        {minimized && (
          <button
            onClick={() => setMinimized(false)}
            className="text-sm text-slate-400 hover:text-white pointer-events-auto transition-colors"
          >
            Tap to show controls
          </button>
        )}
      </Card>
    </div>
  );
}
