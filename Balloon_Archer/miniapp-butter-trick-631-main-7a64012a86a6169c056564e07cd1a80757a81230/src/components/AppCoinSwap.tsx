'use client';

import type React from 'react';
import { useAccount, useBalance } from 'wagmi';
import { type Address, formatUnits } from 'viem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, X, ExternalLink, ArrowLeftRight } from 'lucide-react';

// AppCoin contract deployed by Ohara
const APPCOIN_ADDRESS: Address = '0x875eC94874201fcFbe1ba2efEB1c2b21D39118E8';

// Matcha.xyz swap URL with AppCoin pre-selected
const MATCHA_SWAP_URL = `https://matcha.xyz/tokens/base/${APPCOIN_ADDRESS}`;

interface AppCoinSwapProps {
  onClose: () => void;
}

export function AppCoinSwap({ onClose }: AppCoinSwapProps): React.ReactElement {
  const { address, isConnected } = useAccount();

  // Get AppCoin balance
  const { data: appCoinBalance } = useBalance({
    address,
    token: APPCOIN_ADDRESS,
  });

  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address,
  });

  const handleSwapClick = (): void => {
    // Open Matcha.xyz in a new tab with AppCoin pre-selected
    window.open(MATCHA_SWAP_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <Card className="w-full max-w-lg border-2 border-purple-500/50 bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl relative">
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-white/10 rounded-full z-10"
        >
          <X className="w-5 h-5" />
        </Button>

        <CardHeader className="space-y-1 pr-12">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-purple-400" />
            <CardTitle className="text-2xl font-bold text-white">AppCoin Swap</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            Trade your Ohara AppCoin on Matcha.xyz (Base Network)
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Token Balances */}
          {isConnected && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">AppCoin Balance:</span>
                <span className="text-lg text-purple-400 font-mono font-bold">
                  {appCoinBalance ? formatUnits(appCoinBalance.value, appCoinBalance.decimals) : '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">ETH Balance:</span>
                <span className="text-lg text-blue-400 font-mono font-bold">
                  {ethBalance ? formatUnits(ethBalance.value, ethBalance.decimals) : '0.00'}
                </span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-white">
              <ArrowLeftRight className="w-6 h-6" />
              <p className="text-lg font-semibold">Ready to Swap?</p>
            </div>
            <p className="text-sm text-white/80">
              Swap ETH ⇄ AppCoin with the best rates on Matcha.xyz
            </p>
            <Button
              onClick={handleSwapClick}
              className="w-full bg-white text-purple-900 hover:bg-gray-100 font-bold py-6 text-lg shadow-lg transition-all hover:scale-105"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Open Matcha.xyz to Swap
            </Button>
            <p className="text-xs text-white/60">
              Opens in a new tab • Connect your wallet on Matcha
            </p>
          </div>

          {/* Info */}
          {!isConnected && (
            <div className="text-center text-sm text-yellow-400 bg-yellow-400/10 rounded-lg p-3 border border-yellow-400/30">
              Connect your wallet to view your balances
            </div>
          )}

          {/* Why Matcha? */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 space-y-2">
            <p className="text-xs font-semibold text-purple-400">Why Matcha.xyz?</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>✓ Best swap rates across all Base DEXs</li>
              <li>✓ Aggregates liquidity from Uniswap, SushiSwap & more</li>
              <li>✓ Low fees & slippage protection</li>
            </ul>
          </div>

          {/* Contract Info */}
          <div className="text-xs text-gray-500 text-center border-t border-gray-700 pt-3 space-y-1">
            <p className="text-gray-400">AppCoin Contract (Base Network)</p>
            <p className="font-mono text-[10px] break-all text-purple-400">{APPCOIN_ADDRESS}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
