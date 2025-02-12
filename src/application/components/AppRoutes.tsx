import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import appEnvs from 'appEnvs';
import { useInitApp, useRestoreOldVersionAccount } from 'application/hooks';
import { useNetworkApi } from 'application/hooks';
import { useWalletsStore } from 'application/utils/localStorageUtils';
// import { BuyCryptoPage } from 'buy/pages/BuyCrypto/BuyCrypto';
// import { BuyFiatPage } from 'buy/pages/BuyFiat/BuyFiat';
// import { BuyPage } from 'buy/pages/BuyPage/BuyPage';
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
import { SignAndSendPage } from 'sign-and-send/components/SingAndSendPage';
import { SSOPage } from 'sso/pages/sso/SSOPage';

import { RoutesEnum } from '../typings/routes';

const AppRoutesComponent: React.FC = () => {
  const { activeWallet } = useWalletsStore();
  const { isLoading } = useNetworkApi({
    chainId: activeWallet?.chainId || appEnvs.DEFAULT_CHAIN_ID
  });

  const { initApp } = useInitApp();

  const walletAddress = activeWallet?.address;

  useEffect(() => {
    initApp();
  }, []);

  const { isMigrating } = useRestoreOldVersionAccount();

  if (isLoading || isMigrating) {
    return <FullScreenLoader />;
  }

  return (
    <Routes>
      <Route
        path={walletAddress ? '/' : '/:referrer?'}
        element={walletAddress ? <MainPage /> : <WelcomePage />}
      />
      <Route
        path={RoutesEnum.referralProgram}
        element={<ReferralProgramPage />}
      />
      <Route path={RoutesEnum.add} element={<AddTokenPage />} />
      <Route
        path={`${RoutesEnum.signAndSend}/:message`}
        element={<SignAndSendPage />}
      />
      <Route
        path={`${RoutesEnum.tokenSelection}/:address?`}
        element={<TokenSelectionPage />}
      />
      <Route path={`${RoutesEnum.sso}/:data`} element={<SSOPage />} />
      {/* <Route path={`${RoutesEnum.buy}`} element={<BuyPage />} />
      <Route
        path={`${RoutesEnum.buy}${RoutesEnum.crypto}`}
        element={<BuyCryptoPage />}
      />
      <Route
        path={`${RoutesEnum.buy}${RoutesEnum.fiat}`}
        element={<BuyFiatPage />}
      /> */}
      <Route
        path={`${RoutesEnum.signup}/:dataOrReferrer?`}
        element={<RegistrationPage />}
      />

      <Route path={`${RoutesEnum.login}/:data?`} element={<LoginPage />} />
      <Route
        path={`/:type/:address/:id?${RoutesEnum.send}`}
        element={<SendPage />}
      />

      <Route
        path={`/:type/:address${RoutesEnum.transactions}`}
        element={<TokenTransactionsPage />}
      />
    </Routes>
  );
};

export const AppRoutes = AppRoutesComponent;
