import { CssBaseline } from '@mui/material';
import {
  ThemeProvider as MuiThemeProvider,
  StyledEngineProvider
} from '@mui/material/styles';
import { StylesProvider } from '@mui/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { BrowserRouter } from 'react-router-dom';
import { WagmiConfig } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
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

const queryClient = new QueryClient();

export const defaultEvmChain =
  import.meta.env.MODE === 'prod' ? bsc : bscTestnet;

const chains = [bsc, bscTestnet];

const wagmiConfig = defaultWagmiConfig({
  projectId,
  chains
});

createWeb3Modal({ projectId, wagmiConfig });

export const App = () => (
  <WagmiConfig config={wagmiConfig}>
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
  </WagmiConfig>
);
