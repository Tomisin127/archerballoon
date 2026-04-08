'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, encodeFunctionData, type Address, type Hex } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Trophy, Loader2, CheckCircle2, XCircle, Target, Sparkles } from 'lucide-react';
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
const BASE_BUILDER_CODE = 'bc_qau7xvtg';

interface TokenClaimProps {
  score: number;
  onClose: () => void;
}

export function TokenClaim({ score, onClose }: TokenClaimProps): React.ReactElement {
  const { address, isConnected } = useAccount();
  const [claimStatus, setClaimStatus] = useState<'idle' | 'claiming' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { data: hash, sendTransaction, isPending: isWritePending, error: writeError } = useSendTransaction();
  
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

      const dataWithAttribution = appendBaseBuilderAttribution(mintData, BASE_BUILDER_CODE);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <Card className="w-full max-w-md game-card-highlight border-amber-500/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />

        <CardHeader className="text-center relative pb-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center animate-pulse">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white game-text-glow">Game Over!</CardTitle>
          <div className="mt-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <p className="text-sm text-slate-400 mb-1">Final Score</p>
            <p className="text-4xl font-bold text-amber-400">{Math.floor(score)}</p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 relative pt-0">
          {!isConnected ? (
            <div className="text-center space-y-4 py-4">
              <p className="text-slate-300">
                Connect your wallet to claim <span className="text-emerald-400 font-bold">{Math.floor(score)} $BALLOONS</span>
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <Wallet className="w-4 h-4" />
                <span>Use the wallet button above</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="game-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-sm">Connected Wallet</span>
                  <span className="text-white font-mono text-sm bg-slate-700/50 px-2 py-1 rounded-lg">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Tokens to Claim</span>
                  <span className="text-emerald-400 font-bold text-lg">{Math.floor(score)} $BALLOONS</span>
                </div>
              </div>

              {claimStatus === 'idle' && (
                <Button 
                  onClick={handleClaim}
                  className="w-full h-14 text-lg font-bold game-button-accent"
                  disabled={isProcessing}
                >
                  <Target className="w-5 h-5 mr-2" />
                  Claim Tokens
                </Button>
              )}

              {isProcessing && (
                <div className="flex items-center justify-center gap-3 text-orange-400 py-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-medium">
                    {isWritePending ? 'Confirm in wallet...' : 'Processing...'}
                  </span>
                </div>
              )}

              {claimStatus === 'success' && (
                <div className="flex items-center justify-center gap-3 text-emerald-400 py-4">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-medium">Tokens claimed successfully!</span>
                </div>
              )}

              {claimStatus === 'error' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-rose-400 py-2">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Claim failed</span>
                  </div>
                  {errorMessage && (
                    <p className="text-sm text-rose-300 text-center bg-rose-900/20 rounded-xl p-3 border border-rose-500/30">
                      {errorMessage}
                    </p>
                  )}
                  {!errorMessage.includes('max supply') && (
                    <Button 
                      onClick={handleClaim}
                      variant="outline"
                      className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
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
              className="w-full h-12 font-bold game-button-primary"
            >
              {claimStatus === 'success' ? 'Continue' : 'Play Again'}
            </Button>
          </div>

          <p className="text-xs text-slate-600 text-center">
            Token: {BALLOONS_TOKEN_ADDRESS.slice(0, 10)}...{BALLOONS_TOKEN_ADDRESS.slice(-8)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
