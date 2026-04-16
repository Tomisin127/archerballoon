'use client';

import type React from 'react';
import { WalletButton } from '@/components/WalletButton';
import { SwapModal } from '@/components/SwapModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, ArrowLeftRight, Target, Trophy, Zap, Sparkles } from 'lucide-react';

interface HomeScreenProps {
  onStartGame: () => void;
  onOpenSwap: () => void;
  showSwapModal: boolean;
  onCloseSwap: () => void;
}

// Decorative balloon SVG (crisp, scalable, matches in-game balloons)
function DecorativeBalloon({ color, size = 48, className = '' }: { color: string; size?: number; className?: string }) {
  const id = `grad-${color.replace('#', '')}`;
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 60 84"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="20%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      <ellipse cx="30" cy="34" rx="26" ry="32" fill={`url(#${id})`} />
      <path d="M26 66 L34 66 L30 74 Z" fill={color} opacity="0.7" />
      <path
        d="M30 74 Q36 78 28 82"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="20" cy="22" rx="6" ry="9" fill="white" opacity="0.55" transform="rotate(-20 20 22)" />
      <circle cx="14" cy="32" r="2" fill="white" opacity="0.5" />
    </svg>
  );
}

// Custom logo - bow aiming at balloon
function GameLogo() {
  return (
    <div className="relative w-32 h-32 mx-auto">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-orange-400 via-rose-500 to-orange-600 rotate-6 opacity-90 blur-[1px]" />
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-orange-400 via-orange-500 to-rose-600 shadow-2xl shadow-orange-500/60 border border-orange-300/40" />
      {/* Inner highlight */}
      <div className="absolute inset-x-0 top-0 h-[45%] rounded-t-[2rem] bg-gradient-to-b from-white/25 to-transparent" />
      {/* Icon stack */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
          {/* Target circles */}
          <circle cx="36" cy="36" r="28" stroke="white" strokeWidth="2.5" opacity="0.9" />
          <circle cx="36" cy="36" r="20" stroke="white" strokeWidth="2.5" opacity="0.85" />
          <circle cx="36" cy="36" r="12" stroke="white" strokeWidth="2.5" opacity="0.85" />
          {/* Balloon at center */}
          <ellipse cx="36" cy="32" rx="7" ry="9" fill="#FFDD59" />
          <ellipse cx="33" cy="29" rx="2" ry="3" fill="white" opacity="0.7" />
          <path d="M34 41 L38 41 L36 45 Z" fill="#FFA502" />
          {/* Arrow across */}
          <g>
            <rect x="8" y="35" width="48" height="2.5" rx="1" fill="white" transform="rotate(-18 36 36)" />
            <path d="M58 28 L66 36 L58 44 Z" fill="white" transform="rotate(-18 36 36)" />
          </g>
        </svg>
      </div>
      {/* Sparkle accents */}
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/50 animate-pulse-glow">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}

export function HomeScreen({
  onStartGame,
  onOpenSwap,
  showSwapModal,
  onCloseSwap,
}: HomeScreenProps): React.ReactElement {
  return (
    <main className="relative w-full min-h-screen overflow-hidden sky-backdrop">
      {/* Floating decorative balloons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[12%] left-[8%] animate-float-slow" style={{ animationDelay: '0s' }}>
          <DecorativeBalloon color="#FF3355" size={42} />
        </div>
        <div className="absolute top-[22%] right-[10%] animate-float-medium" style={{ animationDelay: '0.7s' }}>
          <DecorativeBalloon color="#22D36B" size={50} />
        </div>
        <div className="absolute top-[38%] left-[12%] animate-float-fast" style={{ animationDelay: '0.3s' }}>
          <DecorativeBalloon color="#FFC300" size={36} />
        </div>
        <div className="absolute top-[18%] right-[25%] animate-float-slow" style={{ animationDelay: '1.2s' }}>
          <DecorativeBalloon color="#00BCD4" size={48} />
        </div>
        <div className="absolute top-[45%] right-[15%] animate-float-medium" style={{ animationDelay: '1.8s' }}>
          <DecorativeBalloon color="#FF4FA3" size={38} />
        </div>

        {/* Soft sun glow top-right */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-radial from-amber-300/40 via-orange-400/20 to-transparent rounded-full blur-2xl" />
        {/* Ground haze */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-orange-400/30 via-orange-300/10 to-transparent" />

        {/* Distant hill silhouettes */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          height="140"
          viewBox="0 0 1200 140"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,140 L0,85 Q150,45 300,70 Q450,95 600,60 Q750,25 900,55 Q1050,85 1200,50 L1200,140 Z"
            fill="#15803d"
            opacity="0.9"
          />
          <path
            d="M0,140 L0,105 Q200,80 400,100 Q600,120 800,90 Q1000,60 1200,95 L1200,140 Z"
            fill="#14532d"
            opacity="0.95"
          />
        </svg>
      </div>

      {/* Wallet Button */}
      <WalletButton />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-5 pt-12 pb-8">
        {/* Logo/Title Section */}
        <div className="text-center mb-8">
          <GameLogo />

          <h1 className="mt-6 text-5xl md:text-6xl font-black tracking-tight game-text-glow leading-none">
            <span className="game-text-gradient">Balloon</span>
            <br />
            <span className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">Archer</span>
          </h1>
          <p className="mt-3 text-white/90 text-base font-medium tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            Pop balloons. Build combos. Earn{' '}
            <span className="text-amber-300 font-bold">$BALLOON</span>.
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="w-full max-w-sm space-y-3 mb-8">
          <Button
            onClick={onStartGame}
            className="w-full h-16 text-xl font-black game-button-primary animate-pulse-glow tracking-wide"
          >
            <Play className="w-7 h-7 mr-3 fill-current" />
            Play Now
          </Button>

          <Button
            onClick={onOpenSwap}
            className="w-full h-14 text-base font-bold game-button-secondary animate-pulse-glow-emerald"
          >
            <ArrowLeftRight className="w-5 h-5 mr-2.5" />
            Swap $BALLOON
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="w-full max-w-sm grid grid-cols-3 gap-3 mb-6">
          <Card className="game-card p-4 text-center border-orange-500/20">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl tile-gradient-orange flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <p className="text-[11px] text-slate-200 font-bold uppercase tracking-wider">Aim & Shoot</p>
          </Card>
          <Card className="game-card p-4 text-center border-amber-500/20">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl tile-gradient-amber flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <p className="text-[11px] text-slate-200 font-bold uppercase tracking-wider">Earn Tokens</p>
          </Card>
          <Card className="game-card p-4 text-center border-emerald-500/20">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl tile-gradient-emerald flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <p className="text-[11px] text-slate-200 font-bold uppercase tracking-wider">Build Combos</p>
          </Card>
        </div>

        {/* Token Info Card */}
        <Card className="w-full max-w-sm game-card-highlight p-5 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl tile-gradient-orange flex items-center justify-center">
                <span className="text-xl">🎈</span>
                <div className="absolute inset-0 rounded-2xl border-t border-white/40" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Token</p>
                <p className="text-lg font-black text-white leading-tight">$BALLOON</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-br from-sky-500/20 to-blue-600/20 rounded-xl px-3 py-2 border border-sky-400/30">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
                <span className="text-[9px] font-black text-white">B</span>
              </div>
              <div className="leading-tight">
                <p className="text-[9px] text-slate-300 uppercase tracking-wider font-semibold">Network</p>
                <p className="text-sm font-bold text-white">Base</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-[11px] text-white/60 text-center font-mono tracking-wide">
          Contract: 0x875eC...18E8
        </p>
      </div>

      {/* Swap Modal */}
      {showSwapModal && <SwapModal onClose={onCloseSwap} />}
    </main>
  );
}
