import { CssBaseline } from '@mui/material';
import {
  ThemeProvider as MuiThemeProvider,
  StyledEngineProvider
} from '@mui/material/styles';
import { StylesProvider } from '@mui/styles';
import { bsc, bscTestnet } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import appEnvs from 'appEnvs';
import { AppRoutes } from './AppRoutes';
import InitGradientsSvg from './initGradientsSvg.svg?react';
import { UnderConstruction } from '../../common';
import { ToastNotification } from '../../notification/ToastNotification';
import MUITheme from '../utils/MUITheme';

const projectId = appEnvs.PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error('You need to provide VITE_PUBLIC_PROJECT_ID env variable');
}

export const queryClient = new QueryClient();

export const isProduction =
  import.meta.env.MODE === 'prod' || import.meta.env.MODE === 'c100501';

// const power = {
//   id: 1000000003,
//   name: 'POWER',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'SK',
//     symbol: 'tSK'
//   },
//   rpcUrls: {
//     default: {
//       http: ['https://c3n2.thepower.io:1446/jsonrpc']
//     }
//   },
//   testnet: true
// };

export const defaultEvmChain = isProduction ? bsc : bscTestnet;

const metadata = {
  name: 'PowerWallet',
  description: 'PowerWallet',
  url: appEnvs.WALLET_THEPOWER_URL,
  icons: [`${appEnvs.WALLET_THEPOWER_URL}/logo-512x512.png`]
};

const networks = isProduction ? [bsc] : [bscTestnet];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
});

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: isProduction ? [bsc] : [bscTestnet],
  projectId,
  metadata,
  features: {
    analytics: false
  }
});

export const App = () => (
  <WagmiProvider config={wagmiAdapter.wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <StylesProvider injectFirst>
          <StyledEngineProvider injectFirst>
            <MuiThemeProvider theme={MUITheme}>
              <CssBaseline>
                <InitGradientsSvg className='initSvgClass' />
                <ToastNotification />
                <UnderConstruction />
                <AppRoutes />
              </CssBaseline>
            </MuiThemeProvider>
          </StyledEngineProvider>
        </StylesProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </WagmiProvider>
);
