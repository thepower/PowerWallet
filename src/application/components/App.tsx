import { CssBaseline } from '@mui/material';
import {
  ThemeProvider as MuiThemeProvider,
  StyledEngineProvider
} from '@mui/material/styles';
import { StylesProvider } from '@mui/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';
import InitGradientsSvg from './initGradientsSvg.svg?react';
import { UnderConstruction } from '../../common';
import { ToastNotification } from '../../notification/ToastNotification';
import MUITheme from '../utils/MUITheme';

const queryClient = new QueryClient();

export const App = () => (
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
);
