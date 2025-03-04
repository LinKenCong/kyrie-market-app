import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  mainnet,
  bsc,
  bscTestnet,
  polygon,
  sepolia,
  localhost,
} from "wagmi/chains";

// export const config = getDefaultConfig({
//   appName: "Kyrie Market App",
//   projectId: "YOUR_PROJECT_ID",
//   chains: [
//     mainnet,
//     bsc,
//     ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
//       ? [bscTestnet, localhost]
//       : []),
//   ],
//   ssr: true,
// });

export const config = getDefaultConfig({
  appName: "Kyrie Market App(Dev)",
  projectId: "YOUR_PROJECT_ID",
  chains: [
    process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? localhost : bscTestnet,
  ],
  ssr: true,
});
