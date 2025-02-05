"use client";

import { PrivyProvider } from "@privy-io/react-auth";
// Replace this with any of the networks listed at https://github.com/wevm/viem/blob/main/src/chains/index.ts
import {
  base,
  polygon,
  arbitrum,
  storyOdyssey,
  mantle,
  flowTestnet,
  flowMainnet,
} from "viem/chains";
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
     appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        appearance: {
          accentColor: "#6A6FF5",
          theme: "#222224",
          showWalletLoginFirst: false,
          logo: "https://auth.privy.io/logos/privy-logo-dark.png",

          walletChainType: "ethereum-and-solana",
          walletList: [
            "detected_wallets",
            "phantom",
            "solflare",
            "backpack",
            "okx_wallet",
          ],
        },
        defaultChain: flowTestnet,
        supportedChains: [
          base,
          polygon,
          arbitrum,
          storyOdyssey,
          mantle,
          flowTestnet,
          flowMainnet,
        ],
        loginMethods: ["wallet"],
        fundingMethodConfig: {
          moonpay: {
            useSandbox: true,
          },
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          requireUserPasswordOnCreate: false,
          showWalletUIs: true,
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
        externalWallets: {
          solana: {
            connectors: {
              onMount: () => {},
              onUnmount: () => {},
              get: () => [],
            },
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
