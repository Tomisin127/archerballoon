'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

export function GameControls(): React.ReactElement {
  const [visible, setVisible] = useState<boolean>(true);
  const [minimized, setMinimized] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimized(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return <></>;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:top-4 md:left-1/2 md:translate-y-0 z-20 pointer-events-none">
      <Card className={`bg-gray-800/80 backdrop-blur-sm text-white p-4 transition-all duration-300 ${minimized ? 'scale-75 opacity-60' : 'scale-100'}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm">Controls</h3>
          <button
            onClick={() => setVisible(false)}
            className="text-white/60 hover:text-white text-xs pointer-events-auto"
          >
            ✕
          </button>
        </div>
        
        {!minimized && (
          <div className="text-xs space-y-1">
            <p>📱 <strong>Touch & Drag Down:</strong> Set Power</p>
            <p>↔️ <strong>Drag Left/Right:</strong> Aim Angle</p>
            <p>🎯 <strong>Release:</strong> Fire Arrow</p>
            <p>🎈 <strong>Goal:</strong> Pop All Balloons!</p>
          </div>
        )}
        
        {minimized && (
          <button
            onClick={() => setMinimized(false)}
            className="text-xs text-white/60 hover:text-white pointer-events-auto"
          >
            Show More
          </button>
        )}
      </Card>
    </div>
  );
}
