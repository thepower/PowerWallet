import React, { useEffect } from 'react';
import {
  Redirect, Route, Switch,
} from 'react-router-dom';
import { FullScreenLoader } from 'common';
import { LoginPage } from 'registration/components/pages/login/LoginPage';
import { checkIfLoading } from 'network/selectors';
import { AddTokenPage } from 'myAssets/pages/AddToken/AddTokenPage';
import { TokenTransactionsPage } from 'myAssets/pages/TokenTransactions/TokenTransactionsPage';
import { TokenSelectionPage } from 'myAssets/pages/TokenSelection/TokenSelectionPage';
import { MainPage } from 'myAssets/pages/Main/MainPage';
import { SendPage } from 'send/components/SendPage';
import SignAndSendPage from 'sign-and-send/components/SingAndSendPage';
import WalletSSOPage from 'sso/components/pages/WalletSSOPage';
import { getWalletAddress } from 'account/selectors/accountSelectors';
// import { ReferralProgramPage } from 'referral-program/components/pages/ReferralProgramPage';

import { WelcomePage } from 'registration/components/pages/welcome/WelcomePage';
import { RegistrationPage } from 'registration/components/pages/registration/RegistrationPage';
import { useAppDispatch, useAppSelector } from '../store';
import { WalletRoutesEnum } from '../typings/routes';
import { initApplication } from '../slice/applicationSlice';

const AppRoutesComponent: React.FC = () => {
  const dispatch = useAppDispatch();

  const networkApi = useAppSelector(
    (state) => state.applicationData.networkApi,
  );
  const walletApi = useAppSelector((state) => state.applicationData.walletApi);
  const loading = useAppSelector((state) => checkIfLoading(state, initApplication.type));
  const walletAddress = useAppSelector(getWalletAddress);

  useEffect(() => {
    dispatch(initApplication());
  }, [dispatch]);

  if (!walletApi || !networkApi || loading) {
    return <FullScreenLoader />;
  }

  return (
    <Switch>
      <Route
        exact
        path={`${WalletRoutesEnum.signup}/:dataOrReferrer?`}
        component={RegistrationPage}
      />
      <Route exact path={`${WalletRoutesEnum.login}/:data?`} component={LoginPage} />
      <Route path={`${WalletRoutesEnum.sso}/:data`} component={WalletSSOPage} />
      <Route
        path={`/:type/:address/:id?${WalletRoutesEnum.send}`}
        component={SendPage}
      />
      <Route exact path={`${WalletRoutesEnum.add}`} component={AddTokenPage} />
      <Route
        path={`/:type/:address${WalletRoutesEnum.transactions}`}
        component={TokenTransactionsPage}
      />
      <Route
        path={`${WalletRoutesEnum.tokenSelection}/:address?`}
        component={TokenSelectionPage}
        exact
      />
      <Route
        path={`${WalletRoutesEnum.signAndSend}/:message`}
        component={SignAndSendPage}
      />
      {/* <Route exact path={WalletRoutesEnum.referralProgram} component={ReferralProgramPage} /> */}
      <Route exact path={walletAddress ? '/' : '/:referrer?'} component={walletAddress ? MainPage : WelcomePage} />
      <Redirect path="*" to={WalletRoutesEnum.root} />
    </Switch>
  );
};

export const AppRoutes = AppRoutesComponent;
