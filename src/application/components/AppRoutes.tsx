import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import appEnvs from 'appEnvs';
import { useInitApp } from 'application/hooks';
import { useNetworkApi } from 'application/hooks/useNetworkApi';
import { useWallets } from 'application/utils/localStorageUtils';
import { FullScreenLoader } from 'common';
import { AddTokenPage } from 'myAssets/pages/AddToken/AddTokenPage';
import { MainPage } from 'myAssets/pages/Main/MainPage';
import { TokenSelectionPage } from 'myAssets/pages/TokenSelection/TokenSelectionPage';
import { TokenTransactionsPage } from 'myAssets/pages/TokenTransactions/TokenTransactionsPage';
import { checkIfLoading } from 'network/selectors';
import { ReferralProgramPage } from 'referral-program/components/pages/ReferralProgramPage';
import { LoginPage } from 'registration/components/pages/login/LoginPage';
import { RegistrationPage } from 'registration/components/pages/registration/RegistrationPage';
import { WelcomePage } from 'registration/components/pages/welcome/WelcomePage';
import { SendPage } from 'send/components/SendPage';
import SignAndSendPage from 'sign-and-send/components/SingAndSendPage';
import WalletSSOPage from 'sso/components/pages/WalletSSOPage';

import { useAppDispatch, useAppSelector } from '../reduxStore';
import { initApplication } from '../slice/applicationSlice';
import { WalletRoutesEnum } from '../typings/routes';

const AppRoutesComponent: React.FC = () => {
  const { activeWallet } = useWallets();

  const dispatch = useAppDispatch();
  const { isLoading } = useNetworkApi({
    chainId: activeWallet?.chainId || appEnvs.DEFAULT_CHAIN_ID
  });

  const { initApp } = useInitApp();

  const networkApi = useAppSelector(
    (state) => state.applicationData.networkApi
  );
  const loading = useAppSelector((state) =>
    checkIfLoading(state, initApplication.type)
  );
  const walletAddress = useAppSelector(getWalletAddress);

  useEffect(() => {
    initApp();
    dispatch(initApplication());
  }, [dispatch]);

  if (!networkApi || loading || isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Routes>
      <Route path={walletAddress ? '/' : '/:referrer?'}>
        <Route index element={walletAddress ? <MainPage /> : <WelcomePage />} />
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
      </Route>
    </Routes>
  );
};

export const AppRoutes = AppRoutesComponent;
