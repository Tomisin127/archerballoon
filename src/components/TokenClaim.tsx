'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, encodeFunctionData, type Address, type Hex } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Trophy, Loader2, CheckCircle2, XCircle, Target, Sparkles, Gift } from 'lucide-react';
import { appendBaseBuilderAttribution } from '@/utils/baseBuilderAttribution';

const BALLOONS_TOKEN_ABI = [
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

const BALLOONS_TOKEN_ADDRESS: Address = '0xBE0B122499C5685B7582730488881562f1aA2a7A';

interface TokenClaimProps {
  score: number;
  onClose: () => void;
}

// Decorative confetti scattered around the modal
function ConfettiDecoration() {
  const confettiColors = ['#FF3355', '#FF7A00', '#FFC300', '#22D36B', '#00BCD4', '#FF4FA3'];
  const pieces = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    color: confettiColors[i % confettiColors.length],
    left: `${(i * 7) % 100}%`,
    delay: `${(i * 0.15) % 2}s`,
    rotate: `${(i * 37) % 360}deg`,
    size: 6 + ((i * 3) % 6),
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 animate-float-slow"
          style={{
            left: p.left,
            animationDelay: p.delay,
            transform: `rotate(${p.rotate})`,
            width: `${p.size}px`,
            height: `${p.size * 1.6}px`,
            background: p.color,
            borderRadius: '2px',
            top: `${(p.id * 6) % 40}px`,
            opacity: 0.85,
            boxShadow: `0 0 8px ${p.color}80`,
          }}
        />
      ))}
    </div>
  );
}

export function TokenClaim({ score, onClose }: TokenClaimProps): React.ReactElement {
  const { address, isConnected } = useAccount();
  const [claimStatus, setClaimStatus] = useState<'idle' | 'claiming' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { data: hash, sendTransaction, isPending: isWritePending, error: writeError } =
    useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirmed) {
      setClaimStatus('success');
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (writeError) {
      const errorMsg = writeError.message.toLowerCase();

      if (errorMsg.includes('insufficient funds') || errorMsg.includes('insufficient balance')) {
        setErrorMessage('Insufficient ETH for gas fees. Add Base ETH to your wallet.');
      } else if (errorMsg.includes('max supply exceeded')) {
        setErrorMessage('Token max supply reached.');
      } else if (errorMsg.includes('user rejected') || errorMsg.includes('user denied')) {
        setErrorMessage('Transaction rejected. Try again.');
      } else {
        setErrorMessage(writeError.message);
      }

      setClaimStatus('error');
    }
  }, [writeError]);

  const handleClaim = async (): Promise<void> => {
    if (!address || !isConnected) {
      setErrorMessage('Connect your wallet first');
      setClaimStatus('error');
      return;
    }

    try {
      setClaimStatus('claiming');
      setErrorMessage('');

      const tokenAmount = parseUnits(score.toString(), 18);

      const mintData = encodeFunctionData({
        abi: BALLOONS_TOKEN_ABI,
        functionName: 'mint',
        args: [tokenAmount],
      }) as Hex;

      const dataWithAttribution = appendBaseBuilderAttribution(mintData);

      sendTransaction({
        to: BALLOONS_TOKEN_ADDRESS,
        data: dataWithAttribution,
        value: BigInt(1),
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to claim tokens';

      if (errorMsg.toLowerCase().includes('insufficient funds')) {
        setErrorMessage('Insufficient ETH for gas fees.');
      } else if (errorMsg.toLowerCase().includes('max supply exceeded')) {
        setErrorMessage('Token max supply reached.');
      } else {
        setErrorMessage(errorMsg);
      }

      setClaimStatus('error');
    }
  };

  const isProcessing = isWritePending || isConfirming;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md game-card-highlight border-amber-400/40 relative overflow-hidden">
        {/* Background decoration — bright radial glows */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-gradient-to-br from-amber-300/30 to-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-gradient-to-br from-rose-400/20 to-orange-500/15 rounded-full blur-3xl" />

        {/* Confetti scattered around top */}
        <ConfettiDecoration />

        <CardHeader className="text-center relative pb-2 pt-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              {/* Trophy tile with richer gradient */}
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/50 border border-amber-200/50 animate-pulse-glow">
                <Trophy className="w-12 h-12 text-white drop-shadow-lg" />
                <div className="absolute inset-0 rounded-3xl border-t border-white/50" />
              </div>
              {/* Spinning sparkle accent */}
              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/50 animate-spin-slow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              {/* Second sparkle */}
              <div className="absolute -bottom-2 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/50">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <CardTitle className="text-4xl font-black text-white game-text-glow">
            Game Over!
          </CardTitle>

          {/* Final Score */}
          <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-800/80 border border-amber-400/30 relative overflow-hidden">
            <div className="absolute inset-0 border-t border-white/10 pointer-events-none rounded-2xl" />
            <p className="text-[11px] text-slate-400 uppercase tracking-widest mb-2 font-bold">
              Final Score
            </p>
            <p className="text-5xl font-black game-text-gradient tabular-nums leading-none">
              {Math.floor(score).toLocaleString()}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative pt-0">
          {!isConnected ? (
            <div className="text-center space-y-4 py-4">
              <p className="text-slate-200 text-base">
                Connect your wallet to claim{' '}
                <span className="game-text-gradient-emerald font-black">
                  {Math.floor(score)} $BALLOONS
                </span>
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400 bg-slate-900/60 rounded-xl py-2.5 px-4 border border-slate-700/50">
                <Wallet className="w-4 h-4" />
                <span>Use the wallet button above</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="game-card p-4 border-emerald-500/20">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-700/50">
                  <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">
                    Connected Wallet
                  </span>
                  <span className="text-white font-mono text-xs bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/50">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm font-semibold flex items-center gap-2">
                    <Gift className="w-4 h-4 text-emerald-400" />
                    Tokens to Claim
                  </span>
                  <span className="game-text-gradient-emerald font-black text-xl tabular-nums">
                    {Math.floor(score)}
                  </span>
                </div>
              </div>

              {claimStatus === 'idle' && (
                <Button
                  onClick={handleClaim}
                  className="w-full h-14 text-lg font-black game-button-accent tracking-wide"
                  disabled={isProcessing}
                >
                  <Target className="w-5 h-5 mr-2" />
                  Claim Tokens
                </Button>
              )}

              {isProcessing && (
                <div className="flex items-center justify-center gap-3 text-orange-400 py-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-bold">
                    {isWritePending ? 'Confirm in wallet...' : 'Processing...'}
                  </span>
                </div>
              )}

              {claimStatus === 'success' && (
                <div className="flex items-center justify-center gap-3 text-emerald-300 py-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-xl border border-emerald-400/30">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-bold">Tokens claimed successfully!</span>
                </div>
              )}

              {claimStatus === 'error' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-rose-400 py-2">
                    <XCircle className="w-5 h-5" />
                    <span className="font-bold">Claim failed</span>
                  </div>
                  {errorMessage && (
                    <p className="text-sm text-rose-200 text-center bg-rose-900/30 rounded-xl p-3 border border-rose-500/40">
                      {errorMessage}
                    </p>
                  )}
                  {!errorMessage.includes('max supply') && (
                    <Button
                      onClick={handleClaim}
                      variant="outline"
                      className="w-full border-rose-500/40 text-rose-300 hover:bg-rose-500/10 hover:text-white"
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={onClose}
              className="w-full h-12 font-black game-button-primary tracking-wide"
            >
              {claimStatus === 'success' ? 'Continue' : 'Play Again'}
            </Button>
          </div>

          <p className="text-[10px] text-slate-500 text-center font-mono tracking-wide">
            Token: {BALLOONS_TOKEN_ADDRESS.slice(0, 10)}...{BALLOONS_TOKEN_ADDRESS.slice(-8)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
