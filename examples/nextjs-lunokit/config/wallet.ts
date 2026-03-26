import { createConfig } from "@luno-kit/react";
import { polkadot, kusama } from "@luno-kit/react/chains";
import {
  polkadotjsConnector,
  talismanConnector,
  subwalletConnector,
} from "@luno-kit/react/connectors";

export const walletConfig = createConfig({
  appName: "Better-SIWP",
  chains: [polkadot, kusama],
  connectors: [
    polkadotjsConnector(),
    talismanConnector(),
    subwalletConnector(),
  ],
});
