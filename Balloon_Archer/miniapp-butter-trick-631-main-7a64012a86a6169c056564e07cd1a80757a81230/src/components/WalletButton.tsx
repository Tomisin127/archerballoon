'use client';

import type React from 'react';
import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Name } from '@coinbase/onchainkit/identity';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { base } from 'wagmi/chains';

export function WalletButton(): React.ReactElement {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleConnect = (): void => {
    const coinbaseConnector = connectors[0];
    if (coinbaseConnector) {
      connect({ connector: coinbaseConnector });
    }
  };

  if (!isConnected) {
    return (
      <div className="fixed top-2 right-2 z-50">
        <Button
          onClick={handleConnect}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 h-auto shadow-md"
        >
          <Wallet className="w-3 h-3 mr-1.5" />
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
          className="bg-gray-800/80 hover:bg-gray-700/80 text-white text-xs px-2 py-1.5 h-auto shadow-md backdrop-blur-sm"
        >
          <Wallet className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-2 right-2 z-50">
      <div className="flex items-center gap-1 bg-gray-800/90 backdrop-blur-sm rounded-md px-2 py-1.5 shadow-md border border-gray-700/50 text-xs">
        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
        
        {address && (
          <Name
            address={address}
            chain={base}
            className="text-white font-medium max-w-[120px] truncate"
          >
            <span className="text-white font-mono">
              {address.slice(0, 4)}...{address.slice(-3)}
            </span>
          </Name>
        )}
        
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-300 ml-1"
          aria-label="Minimize"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        
        <button
          onClick={() => disconnect()}
          className="text-red-400 hover:text-red-300 ml-0.5"
          aria-label="Disconnect"
        >
          <LogOut className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
