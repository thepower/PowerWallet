import React from 'react';
import { CssBaseline } from '@mui/material';
import {
  ThemeProvider as MuiThemeProvider,
  StyledEngineProvider
} from '@mui/material/styles';
import { StylesProvider } from '@mui/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { AppRoutes } from './AppRoutes';
import InitGradientsSvg from './initGradientsSvg.svg?react';
import { UnderConstruction } from '../../common';
import { ToastNotification } from '../../notification/ToastNotification';
import { store, persistor } from '../reduxStore';
import MUITheme from '../utils/MUITheme';

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
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
      </PersistGate>
    </Provider>
  </QueryClientProvider>
);
