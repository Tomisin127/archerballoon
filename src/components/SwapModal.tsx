'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { 
  formatUnits, 
  parseUnits, 
  encodeFunctionData, 
  createPublicClient, 
  http,
  type Address,
  type Hex,
  fallback
} from 'viem';
import { base } from 'wagmi/chains';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, 
  ArrowDownUp, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Wallet,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { appendBaseBuilderAttribution } from '@/utils/baseBuilderAttribution';

// Contract addresses on Base
const TOKEN_ADDRESS: Address = '0x875eC94874201fcFbe1ba2efEB1c2b21D39118E8';
const WETH_ADDRESS: Address = '0x4200000000000000000000000000000000000006';
const UNISWAP_V3_QUOTER: Address = '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a';
const UNISWAP_V3_ROUTER: Address = '0x2626664c2603336E57B271c5C0b26F421741e481';

// Multiple RPC endpoints for reliability
const BASE_RPC_URLS = [
  'https://mainnet.base.org',
  'https://base.llamarpc.com',
  'https://1rpc.io/base',
  'https://base.drpc.org'
];

// Pool fee tiers to try
const POOL_FEES = [10000, 3000, 500, 100];

// ABIs
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const QUOTER_V2_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'fee', type: 'uint24' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'quoteExactInputSingle',
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'sqrtPriceX96After', type: 'uint160' },
      { name: 'initializedTicksCrossed', type: 'uint32' },
      { name: 'gasEstimate', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const SWAP_ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'exactInputSingle',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'deadline', type: 'uint256' },
      { name: 'data', type: 'bytes[]' },
    ],
    name: 'multicall',
    outputs: [{ name: 'results', type: 'bytes[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'amountMinimum', type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
    name: 'unwrapWETH9',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

// Create public client with fallback RPCs
const publicClient = createPublicClient({
  chain: base,
  transport: fallback(BASE_RPC_URLS.map(url => http(url))),
});

interface SwapModalProps {
  onClose: () => void;
}

export function SwapModal({ onClose }: SwapModalProps): React.ReactElement {
  const { address, isConnected } = useAccount();
  const [isBuying, setIsBuying] = useState(true);
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [isQuoting, setIsQuoting] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [bestFee, setBestFee] = useState<number>(3000);
  const [slippage, setSlippage] = useState(5);
  const [swapStatus, setSwapStatus] = useState<'idle' | 'approving' | 'swapping' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Get balances
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address,
  });

  const { data: tokenBalance, refetch: refetchTokenBalance } = useBalance({
    address,
    token: TOKEN_ADDRESS,
  });

  const { data: txHash, sendTransaction, isPending, error: txError } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      setSwapStatus('success');
      toast.success('Swap completed successfully!');
      refetchEthBalance();
      refetchTokenBalance();
      setInputAmount('');
      setOutputAmount('');
    }
  }, [isConfirmed, refetchEthBalance, refetchTokenBalance]);

  // Handle transaction errors
  useEffect(() => {
    if (txError) {
      const errorMsg = txError.message.toLowerCase();
      if (errorMsg.includes('user rejected') || errorMsg.includes('user denied')) {
        setErrorMessage('Transaction was rejected');
      } else if (errorMsg.includes('insufficient funds')) {
        setErrorMessage('Insufficient funds for gas');
      } else {
        setErrorMessage('Transaction failed');
      }
      setSwapStatus('error');
    }
  }, [txError]);

  // Quote function with retry logic
  const getQuote = useCallback(async (amountIn: bigint, tokenIn: Address, tokenOut: Address) => {
    let bestQuote = BigInt(0);
    let bestFeeFound = 3000;

    // Try all fee tiers in parallel
    const quotePromises = POOL_FEES.map(async (fee) => {
      try {
        const callData = encodeFunctionData({
          abi: QUOTER_V2_ABI,
          functionName: 'quoteExactInputSingle',
          args: [{
            tokenIn,
            tokenOut,
            amountIn,
            fee,
            sqrtPriceLimitX96: BigInt(0),
          }],
        });

        const result = await publicClient.call({
          to: UNISWAP_V3_QUOTER,
          data: callData,
        });

        if (result.data) {
          // Decode the result - first 32 bytes is amountOut
          const amountOut = BigInt(`0x${result.data.slice(2, 66)}`);
          return { fee, amountOut };
        }
      } catch {
        return null;
      }
      return null;
    });

    const results = await Promise.all(quotePromises);
    
    for (const result of results) {
      if (result && result.amountOut > bestQuote) {
        bestQuote = result.amountOut;
        bestFeeFound = result.fee;
      }
    }

    return { amountOut: bestQuote, fee: bestFeeFound };
  }, []);

  // Debounced quote fetching
  useEffect(() => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setOutputAmount('');
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsQuoting(true);
      try {
        const decimals = isBuying ? 18 : 18; // ETH and token both 18 decimals
        const amountIn = parseUnits(inputAmount, decimals);
        const tokenIn = isBuying ? WETH_ADDRESS : TOKEN_ADDRESS;
        const tokenOut = isBuying ? TOKEN_ADDRESS : WETH_ADDRESS;

        const { amountOut, fee } = await getQuote(amountIn, tokenIn, tokenOut);
        
        if (amountOut > BigInt(0)) {
          setOutputAmount(formatUnits(amountOut, 18));
          setBestFee(fee);
        } else {
          setOutputAmount('');
        }
      } catch (err) {
        console.error('Quote error:', err);
        setOutputAmount('');
      } finally {
        setIsQuoting(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputAmount, isBuying, getQuote]);

  // Check allowance for selling tokens
  useEffect(() => {
    if (!address || isBuying || !inputAmount) {
      setNeedsApproval(false);
      return;
    }

    const checkAllowance = async () => {
      try {
        const allowance = await publicClient.readContract({
          address: TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, UNISWAP_V3_ROUTER],
        });

        const amountIn = parseUnits(inputAmount, 18);
        setNeedsApproval(allowance < amountIn);
      } catch (err) {
        console.error('Allowance check error:', err);
      }
    };

    checkAllowance();
  }, [address, isBuying, inputAmount]);

  const handleApprove = async () => {
    if (!address) return;
    
    setSwapStatus('approving');
    setErrorMessage('');

    try {
      const approveData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [UNISWAP_V3_ROUTER, parseUnits('1000000000', 18)],
      });

      sendTransaction({
        to: TOKEN_ADDRESS,
        data: approveData,
      });
    } catch (err) {
      console.error('Approve error:', err);
      setErrorMessage('Failed to approve');
      setSwapStatus('error');
    }
  };

  const handleSwap = async () => {
    if (!address || !inputAmount || !outputAmount) return;

    setSwapStatus('swapping');
    setErrorMessage('');

    try {
      const amountIn = parseUnits(inputAmount, 18);
      const amountOutMin = parseUnits(outputAmount, 18) * BigInt(100 - slippage) / BigInt(100);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800); // 30 minutes

      if (isBuying) {
        // ETH -> Token (Buy)
        const swapData = encodeFunctionData({
          abi: SWAP_ROUTER_ABI,
          functionName: 'exactInputSingle',
          args: [{
            tokenIn: WETH_ADDRESS,
            tokenOut: TOKEN_ADDRESS,
            fee: bestFee,
            recipient: address,
            amountIn,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: BigInt(0),
          }],
        });

        const multicallData = encodeFunctionData({
          abi: SWAP_ROUTER_ABI,
          functionName: 'multicall',
          args: [deadline, [swapData]],
        });

        sendTransaction({
          to: UNISWAP_V3_ROUTER,
          data: appendBaseBuilderAttribution(multicallData),
          value: amountIn,
        });
      } else {
        // Token -> ETH (Sell)
        const swapData = encodeFunctionData({
          abi: SWAP_ROUTER_ABI,
          functionName: 'exactInputSingle',
          args: [{
            tokenIn: TOKEN_ADDRESS,
            tokenOut: WETH_ADDRESS,
            fee: bestFee,
            recipient: UNISWAP_V3_ROUTER, // Send to router for unwrapping
            amountIn,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: BigInt(0),
          }],
        });

        const unwrapData = encodeFunctionData({
          abi: SWAP_ROUTER_ABI,
          functionName: 'unwrapWETH9',
          args: [amountOutMin, address],
        });

        const multicallData = encodeFunctionData({
          abi: SWAP_ROUTER_ABI,
          functionName: 'multicall',
          args: [deadline, [swapData, unwrapData]],
        });

        sendTransaction({
          to: UNISWAP_V3_ROUTER,
          data: appendBaseBuilderAttribution(multicallData),
        });
      }
    } catch (err) {
      console.error('Swap error:', err);
      setErrorMessage('Failed to execute swap');
      setSwapStatus('error');
    }
  };

  const handleMaxClick = () => {
    if (isBuying) {
      // Use 90% of ETH balance for gas reserve
      if (ethBalance) {
        const maxAmount = ethBalance.value * BigInt(90) / BigInt(100);
        setInputAmount(formatUnits(maxAmount, 18));
      }
    } else {
      // Use full token balance
      if (tokenBalance) {
        setInputAmount(formatUnits(tokenBalance.value, 18));
      }
    }
  };

  const toggleDirection = () => {
    setIsBuying(!isBuying);
    setInputAmount('');
    setOutputAmount('');
    setSwapStatus('idle');
    setErrorMessage('');
  };

  const isProcessing = isPending || isConfirming;
  const inputBalance = isBuying 
    ? (ethBalance ? formatUnits(ethBalance.value, 18) : '0')
    : (tokenBalance ? formatUnits(tokenBalance.value, 18) : '0');

  const hasInsufficientBalance = inputAmount && parseFloat(inputAmount) > parseFloat(inputBalance);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md game-card-highlight border-emerald-500/40 relative overflow-hidden">
        {/* Vibrant background decoration */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-emerald-400/30 to-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-br from-orange-400/25 to-rose-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-sky-500/5 to-transparent rounded-full blur-3xl" />

        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-xl z-10 border border-slate-700/50"
        >
          <X className="w-5 h-5" />
        </Button>

        <CardHeader className="pb-4 pr-14 relative">
          <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl tile-gradient-emerald flex items-center justify-center relative">
              <ArrowDownUp className="w-6 h-6 text-white" />
              <div className="absolute inset-0 rounded-2xl border-t border-white/40" />
            </div>
            <span>
              Swap{' '}
              <span className="game-text-gradient-emerald">$BALLOON</span>
            </span>
          </CardTitle>
          <p className="text-slate-300 text-sm mt-2 font-medium">
            Trade on Uniswap V3 • Base Network
          </p>
        </CardHeader>

        <CardContent className="space-y-4 relative">
          {!isConnected ? (
            <div className="text-center py-8 space-y-4">
              <Wallet className="w-12 h-12 mx-auto text-slate-500" />
              <p className="text-slate-400">Connect your wallet to swap</p>
            </div>
          ) : (
            <>
              {/* Input Section */}
              <div className="game-card p-4 space-y-2 border-slate-700/60">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-semibold uppercase text-[11px] tracking-widest">
                    {isBuying ? 'You pay' : 'You sell'}
                  </span>
                  <span className="text-slate-400 text-xs font-medium">
                    Balance:{' '}
                    <span className="text-slate-200 tabular-nums">
                      {parseFloat(inputBalance).toFixed(4)}
                    </span>{' '}
                    {isBuying ? 'ETH' : 'BALLOON'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    className="game-input text-2xl font-black h-14 flex-1 tabular-nums"
                  />
                  <Button
                    onClick={handleMaxClick}
                    size="sm"
                    className="text-orange-300 hover:text-orange-200 hover:bg-orange-500/20 bg-orange-500/10 border border-orange-500/30 font-black text-xs"
                  >
                    MAX
                  </Button>
                  <div
                    className={`px-3 py-2.5 rounded-xl text-white font-black text-sm flex items-center gap-1.5 border ${
                      isBuying
                        ? 'bg-gradient-to-br from-sky-500/30 to-blue-600/30 border-sky-400/40'
                        : 'bg-gradient-to-br from-orange-500/30 to-rose-500/30 border-orange-400/40'
                    }`}
                  >
                    {isBuying ? 'ETH' : '🎈 BALLOON'}
                  </div>
                </div>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center -my-2 relative z-10">
                <Button
                  onClick={toggleDirection}
                  variant="ghost"
                  size="icon"
                  className="w-11 h-11 rounded-full bg-slate-900 border-2 border-orange-500/50 hover:border-orange-400 hover:bg-slate-800 transition-all shadow-lg shadow-orange-500/20 active:scale-90"
                  aria-label="Swap direction"
                >
                  <ArrowDownUp className="w-4 h-4 text-orange-400" />
                </Button>
              </div>

              {/* Output Section */}
              <div className="game-card p-4 space-y-2 border-emerald-500/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-semibold uppercase text-[11px] tracking-widest">
                    {isBuying ? 'You receive' : 'You get'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-14 flex items-center px-4 bg-slate-950/60 rounded-xl border border-slate-700/50">
                    {isQuoting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                        <span className="text-slate-400 text-sm">Fetching quote...</span>
                      </div>
                    ) : (
                      <span
                        className={`text-2xl font-black tabular-nums ${
                          outputAmount ? 'text-emerald-300' : 'text-slate-500'
                        }`}
                      >
                        {outputAmount ? parseFloat(outputAmount).toFixed(6) : '0.0'}
                      </span>
                    )}
                  </div>
                  <div
                    className={`px-3 py-2.5 rounded-xl text-white font-black text-sm flex items-center gap-1.5 border ${
                      isBuying
                        ? 'bg-gradient-to-br from-orange-500/30 to-rose-500/30 border-orange-400/40'
                        : 'bg-gradient-to-br from-sky-500/30 to-blue-600/30 border-sky-400/40'
                    }`}
                  >
                    {isBuying ? '🎈 BALLOON' : 'ETH'}
                  </div>
                </div>
              </div>

              {/* Slippage */}
              <div className="flex items-center justify-between text-sm text-slate-300 px-1">
                <span className="font-semibold uppercase text-[11px] tracking-widest">
                  Slippage tolerance
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 3, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSlippage(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                        slippage === s
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30 scale-105'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700/50'
                      }`}
                    >
                      {s}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4" />
                  {errorMessage}
                </div>
              )}

              {/* Action Buttons */}
              {swapStatus === 'success' ? (
                <div className="flex items-center justify-center gap-2 text-emerald-400 py-4">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Swap successful!</span>
                  {txHash && (
                    <a
                      href={`https://basescan.org/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ) : isProcessing ? (
                <div className="flex items-center justify-center gap-2 text-orange-400 py-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">
                    {isPending ? 'Confirm in wallet...' : 'Processing...'}
                  </span>
                </div>
              ) : needsApproval && !isBuying ? (
                <Button
                  onClick={handleApprove}
                  className="w-full h-14 text-lg font-bold game-button-accent"
                  disabled={isProcessing}
                >
                  Approve $BALLOON
                </Button>
              ) : (
                <Button
                  onClick={handleSwap}
                  className="w-full h-14 text-lg font-bold game-button-secondary"
                  disabled={
                    !inputAmount || 
                    !outputAmount || 
                    isQuoting || 
                    hasInsufficientBalance ||
                    isProcessing
                  }
                >
                  {hasInsufficientBalance 
                    ? 'Insufficient Balance' 
                    : isBuying 
                      ? 'Buy $BALLOON' 
                      : 'Sell $BALLOON'
                  }
                </Button>
              )}

              {/* Contract Info */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-600">
                  Token: 0x875eC...18E8
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
