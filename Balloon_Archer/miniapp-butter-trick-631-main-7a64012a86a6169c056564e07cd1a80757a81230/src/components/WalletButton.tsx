'use client';

import type React from 'react';
import { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, ChevronUp } from 'lucide-react';
import { mainnet } from 'wagmi/chains';

export function WalletButton(): React.ReactElement {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Use wagmi's useEnsName hook for ENS resolution
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  });

  const handleConnect = (): void => {
    const coinbaseConnector = connectors[0];
    if (coinbaseConnector) {
      connect({ connector: coinbaseConnector });
    }
  };

  const displayName = ensName || (address ? `${address.slice(0, 4)}...${address.slice(-3)}` : '');

  if (!isConnected) {
    return (
      <div className="fixed top-2 right-2 z-50">
        <Button
          onClick={handleConnect}
          size="sm"
          className="game-button-primary text-xs px-4 py-2 h-auto shadow-lg"
        >
          <Wallet className="w-3.5 h-3.5 mr-1.5" />
          Connect
        </Button>
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <div className="fixed top-2 right-2 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          size="sm"
          variant="ghost"
          className="bg-slate-900/90 hover:bg-slate-800/90 text-white text-xs px-2 py-1.5 h-auto shadow-lg backdrop-blur-sm border border-emerald-500/30"
        >
          <Wallet className="w-3.5 h-3.5 text-emerald-400" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-2 right-2 z-50">
      <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-emerald-500/30 text-xs">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400/50"></div>
        
        <span className="text-white font-medium font-mono">
          {displayName}
        </span>
        
        <button
          onClick={() => setIsExpanded(false)}
          className="text-slate-400 hover:text-slate-200 ml-1 transition-colors"
          aria-label="Minimize"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        
        <button
          onClick={() => disconnect()}
          className="text-rose-400 hover:text-rose-300 ml-0.5 transition-colors"
          aria-label="Disconnect"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
