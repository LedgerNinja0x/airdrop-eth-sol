import '@fontsource/poppins';
import '@/styles/globals.css';
import axios from 'axios';
import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import {
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import { useMemo } from 'react';

const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: '2d119270fa00d9a4468bebb74eb136bb',
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  ssr: true,
})

const client = new QueryClient();

axios.defaults.baseURL = process.env.NEXTAUTH_URL;

export default function App({ Component, pageProps }) {

  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  let network;
  console.log("env vars", process.env);
  if (process.env.ENVIRONMENT_MODE == "PROD") {
    network = WalletAdapterNetwork.Mainnet;
  } else {
    network = WalletAdapterNetwork.Devnet;
  }

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <Component {...pageProps} />
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
