'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, encodeFunctionData, type Address, type Hex } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Trophy, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { appendBaseBuilderAttribution } from '@/utils/baseBuilderAttribution';

// Updated ABI matching the actual contract: mint(uint256 amount) - anyone can mint
const BALLOONS_TOKEN_ABI = [
  {
    inputs: [
      { name: 'amount', type: 'uint256' }
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

// Contract address for $BALLOONS token on Base network
const BALLOONS_TOKEN_ADDRESS: Address = '0xBE0B122499C5685B7582730488881562f1aA2a7A';

// Base Builder code for transaction tracking
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
      console.error('Write contract error:', writeError);
      
      if (errorMsg.includes('insufficient funds') || errorMsg.includes('insufficient balance')) {
        setErrorMessage('⚠️ Insufficient ETH for gas fees. You need Base ETH to pay for the transaction. Please add some ETH to your wallet.');
      } else if (errorMsg.includes('max supply exceeded')) {
        setErrorMessage('⚠️ Token max supply reached. No more tokens can be minted.');
      } else if (errorMsg.includes('user rejected') || errorMsg.includes('user denied')) {
        setErrorMessage('Transaction was rejected. Please try again and approve the transaction.');
      } else {
        setErrorMessage(writeError.message);
      }
      
      setClaimStatus('error');
    }
  }, [writeError]);

  const handleClaim = async (): Promise<void> => {
    if (!address || !isConnected) {
      setErrorMessage('Please connect your wallet first');
      setClaimStatus('error');
      return;
    }

    try {
      setClaimStatus('claiming');
      setErrorMessage('');

      // Convert score to token amount (1 score = 1 token with 18 decimals)
      const tokenAmount = parseUnits(score.toString(), 18);

      // Encode the mint function call
      const mintData = encodeFunctionData({
        abi: BALLOONS_TOKEN_ABI,
        functionName: 'mint',
        args: [tokenAmount],
      }) as Hex;

      // Append Base Builder attribution to transaction data
      const dataWithAttribution = appendBaseBuilderAttribution(mintData, BASE_BUILDER_CODE);

      console.log('Claiming tokens with Base Builder attribution:', {
        caller: address,
        amount: tokenAmount.toString(),
        contract: BALLOONS_TOKEN_ADDRESS,
        builderCode: BASE_BUILDER_CODE,
        originalData: mintData,
        dataWithAttribution: dataWithAttribution
      });

      // Send transaction with attribution + 1 wei to make it trackable by Base Builder
      sendTransaction({
        to: BALLOONS_TOKEN_ADDRESS,
        data: dataWithAttribution,
        value: BigInt(1), // 1 wei = 0.000000000000000001 ETH
      });

    } catch (error) {
      console.error('Token claim error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to claim tokens';
      
      // Better error detection
      if (errorMsg.toLowerCase().includes('insufficient funds')) {
        setErrorMessage('⚠️ Insufficient ETH for gas fees. Please add some ETH to your wallet on Base network.');
      } else if (errorMsg.toLowerCase().includes('max supply exceeded')) {
        setErrorMessage('⚠️ Token max supply reached. No more tokens can be minted.');
      } else {
        setErrorMessage(errorMsg);
      }
      
      setClaimStatus('error');
    }
  };

  const isProcessing = isWritePending || isConfirming;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <Card className="w-full max-w-md border-2 border-blue-500/50 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Trophy className="w-16 h-16 text-yellow-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">Game Over!</CardTitle>
          <CardDescription className="text-lg text-gray-300">
            Final Score: <span className="text-yellow-400 font-bold text-2xl">{score}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">


          {!isConnected ? (
            <div className="text-center space-y-4">
              <p className="text-gray-300">
                Connect your wallet to claim <span className="text-green-400 font-bold">{score} $BALLOONS</span> tokens!
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <Wallet className="w-4 h-4" />
                <span>Use the wallet button in the top navigation</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Wallet:</span>
                  <span className="text-white font-mono text-sm">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Claiming:</span>
                  <span className="text-green-400 font-bold">{score} $BALLOONS</span>
                </div>
              </div>

              {claimStatus === 'idle' && (
                <Button 
                  onClick={handleClaim}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 text-lg"
                  disabled={isProcessing}
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Claim $BALLOONS Tokens
                </Button>
              )}

              {isProcessing && (
                <div className="flex items-center justify-center gap-3 text-blue-400 py-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-medium">
                    {isWritePending ? 'Preparing transaction...' : 'Confirming on blockchain...'}
                  </span>
                </div>
              )}

              {claimStatus === 'success' && (
                <div className="flex items-center justify-center gap-3 text-green-400 py-4">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-medium">Tokens claimed successfully!</span>
                </div>
              )}

              {claimStatus === 'error' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-3 text-red-400 py-2">
                    <XCircle className="w-6 h-6" />
                    <span className="font-medium">Claim failed</span>
                  </div>
                  {errorMessage && (
                    <p className="text-sm text-red-300 text-center bg-red-900/20 rounded p-3 border border-red-500/30">
                      {errorMessage}
                    </p>
                  )}
                  {!errorMessage.includes('max supply') && (
                    <Button 
                      onClick={handleClaim}
                      variant="outline"
                      className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-gray-700">
            <Button 
              onClick={onClose}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {claimStatus === 'success' ? 'Continue' : 'Play Again'}
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>Token contract: Base Network</p>
            <p className="font-mono text-[10px] break-all">{BALLOONS_TOKEN_ADDRESS}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
