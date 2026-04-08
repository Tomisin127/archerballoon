import { createConfig, http, cookieStorage, createStorage } from 'wagmi';
import { base, baseSepolia, mainnet } from 'wagmi/chains';
import { coinbaseWallet, metaMask, injected } from 'wagmi/connectors';

const chainId = process.env.NEXT_PUBLIC_SDK_CHAIN_ID
  ? Number(process.env.NEXT_PUBLIC_SDK_CHAIN_ID)
  : base.id; // Default to Base mainnet for production

export const activeChain = chainId === 84532 ? baseSepolia : base;

export const config = createConfig({
  chains: [activeChain, mainnet],
  connectors: [
    // Coinbase Wallet - supports both TBA and EOA
    coinbaseWallet({
      appName: 'Balloon Archer',
      preference: 'all',
    }),
    // MetaMask
    metaMask({
      dappMetadata: {
        name: 'Balloon Archer',
      },
    }),
    // Injected wallets
    injected({ target: 'phantom' }),
    injected({ target: 'rabby' }),
    injected({ target: 'trust' }),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [mainnet.id]: http(), // For ENS resolution
  },
});
