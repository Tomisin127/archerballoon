'use client';

import type React from 'react';
import { WalletButton } from '@/components/WalletButton';
import { SwapModal } from '@/components/SwapModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, ArrowLeftRight, Target, Trophy, Zap } from 'lucide-react';

interface HomeScreenProps {
  onStartGame: () => void;
  onOpenSwap: () => void;
  showSwapModal: boolean;
  onCloseSwap: () => void;
}

export function HomeScreen({ 
  onStartGame, 
  onOpenSwap, 
  showSwapModal, 
  onCloseSwap 
}: HomeScreenProps): React.ReactElement {
  return (
    <main className="relative w-full min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-[#0f2027] to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Balloons Animation */}
        <div className="absolute top-20 left-[10%] w-12 h-16 rounded-full bg-gradient-to-b from-rose-400 to-rose-600 opacity-40 animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-[15%] w-10 h-14 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 opacity-40 animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-60 left-[20%] w-8 h-12 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 opacity-40 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-32 right-[25%] w-14 h-20 rounded-full bg-gradient-to-b from-sky-400 to-sky-600 opacity-40 animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-48 left-[35%] w-9 h-13 rounded-full bg-gradient-to-b from-violet-400 to-violet-600 opacity-40 animate-float" style={{ animationDelay: '2s' }} />
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Wallet Button */}
      <WalletButton />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Logo/Title Section */}
        <div className="text-center mb-8">
          {/* Game Icon */}
          <div className="relative mx-auto mb-6 w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-rose-600 rounded-3xl rotate-6 opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-rose-500 rounded-3xl shadow-2xl shadow-orange-500/30" />
            <Target className="relative w-14 h-14 text-white drop-shadow-lg" />
          </div>
          
          {/* Title */}
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight game-text-glow">
            Balloon Archer
          </h1>
          <p className="text-slate-400 text-lg">
            Pop balloons, earn rewards
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="w-full max-w-sm space-y-4 mb-8">
          {/* Play Button */}
          <Button
            onClick={onStartGame}
            className="w-full h-16 text-xl font-bold game-button-primary animate-pulse-glow"
          >
            <Play className="w-7 h-7 mr-3 fill-current" />
            Play Now
          </Button>

          {/* Swap Button */}
          <Button
            onClick={onOpenSwap}
            className="w-full h-14 text-lg font-bold game-button-secondary"
          >
            <ArrowLeftRight className="w-6 h-6 mr-3" />
            Swap $BALLOON
          </Button>
        </div>

        {/* Features Cards */}
        <div className="w-full max-w-sm grid grid-cols-3 gap-3 mb-8">
          <Card className="game-card p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-orange-400" />
            <p className="text-xs text-slate-400 font-medium">Aim & Shoot</p>
          </Card>
          <Card className="game-card p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-400" />
            <p className="text-xs text-slate-400 font-medium">Earn Tokens</p>
          </Card>
          <Card className="game-card p-4 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
            <p className="text-xs text-slate-400 font-medium">Build Combos</p>
          </Card>
        </div>

        {/* Token Info */}
        <Card className="w-full max-w-sm game-card-highlight p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Token</p>
              <p className="text-lg font-bold text-white">$BALLOON</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Network</p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">B</span>
                </div>
                <p className="text-lg font-bold text-white">Base</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-xs text-slate-600 text-center">
          Contract: 0x875eC...18E8
        </p>
      </div>

      {/* Swap Modal */}
      {showSwapModal && (
        <SwapModal onClose={onCloseSwap} />
      )}
    </main>
  );
}
