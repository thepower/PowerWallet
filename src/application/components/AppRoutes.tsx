import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import appEnvs from 'appEnvs';
import { useInitApp } from 'application/hooks';
import { useNetworkApi } from 'application/hooks/useNetworkApi';
import { useWallets } from 'application/utils/localStorageUtils';
import { FullScreenLoader } from 'common';
import { AddTokenPage } from 'myAssets/pages/AddToken/AddTokenPage';
import { MainPage } from 'myAssets/pages/Main/MainPage';
import { TokenSelectionPage } from 'myAssets/pages/TokenSelection/TokenSelectionPage';
import { TokenTransactionsPage } from 'myAssets/pages/TokenTransactions/TokenTransactionsPage';
import { ReferralProgramPage } from 'referral-program/components/pages/ReferralProgramPage';
import { LoginPage } from 'registration/components/pages/login/LoginPage';
import { RegistrationPage } from 'registration/components/pages/registration/RegistrationPage';
import { WelcomePage } from 'registration/components/pages/welcome/WelcomePage';
import { SendPage } from 'send/components/SendPage';
import SignAndSendPage from 'sign-and-send/components/SingAndSendPage';
import WalletSSOPage from 'sso/components/pages/WalletSSOPage';

import { WalletRoutesEnum } from '../typings/routes';

const AppRoutesComponent: React.FC = () => {
  const { activeWallet } = useWallets();

  const { isLoading } = useNetworkApi({
    chainId: activeWallet?.chainId || appEnvs.DEFAULT_CHAIN_ID
  });

  const { initApp } = useInitApp();

  const walletAddress = activeWallet?.address;

  useEffect(() => {
    initApp();
  }, []);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Routes>
      {/* <Route path={'/'}> */}
      <Route
        path={walletAddress ? '/' : '/:referrer?'}
        element={walletAddress ? <MainPage /> : <WelcomePage />}
      />
      <Route
        path={WalletRoutesEnum.referralProgram}
        element={<ReferralProgramPage />}
      />
      <Route path={WalletRoutesEnum.add} element={<AddTokenPage />} />
      <Route
        path={`${WalletRoutesEnum.signAndSend}/:message`}
        element={<SignAndSendPage />}
      />
      <Route
        path={`${WalletRoutesEnum.tokenSelection}/:address?`}
        element={<TokenSelectionPage />}
      />
      <Route
        path={`${WalletRoutesEnum.sso}/:data`}
        element={<WalletSSOPage />}
      />
      <Route
        path={`${WalletRoutesEnum.signup}/:dataOrReferrer?`}
        element={<RegistrationPage />}
      />

      <Route
        path={`${WalletRoutesEnum.login}/:data?`}
        element={<LoginPage />}
      />
      <Route
        path={`/:type/:address/:id?${WalletRoutesEnum.send}`}
        element={<SendPage />}
      />

      <Route
        path={`/:type/:address${WalletRoutesEnum.transactions}`}
        element={<TokenTransactionsPage />}
      />
      {/* </Route> */}
    </Routes>
  );
};

export const AppRoutes = AppRoutesComponent;
