import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { FullScreenLoader } from 'common';
import { RegistrationPage } from 'registration/components/RegistrationPage';
import { LoginPage } from 'registration/components/pages/LoginPage';
import { checkIfLoading } from 'network/selectors';
import { AddTokenPage } from 'myAssets/pages/AddToken/AddTokenPage';
import { TokenTransactionsPage } from 'myAssets/pages/TokenTransactions/TokenTransactionsPage';
import { TokenSelectionPage } from 'myAssets/pages/TokenSelection/TokenSelectionPage';
import { MyAssets } from 'myAssets/pages/Main/MainPage';
import { SendPage } from 'send/components/SendPage';
import SignAndSendPage from 'sign-and-send/components/SingAndSendPage';
import WalletSSOPage from 'sso/components/pages/WalletSSOPage';
import { RegistrationForAppsPage } from 'registration/components/RegistrationForAppsPage';
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
        path={WalletRoutesEnum.signup}
        component={RegistrationPage}
      />
      <Route
        exact
        path={`${WalletRoutesEnum.registrationForApps}/:data`}
        component={RegistrationForAppsPage}
      />
      <Route exact path={WalletRoutesEnum.login} component={LoginPage} />
      <Route
        path={`/:type/:address/:id?${WalletRoutesEnum.send}`}
        component={SendPage}
      />
      <Route exact path={`${WalletRoutesEnum.add}`}>
        <AddTokenPage />
      </Route>
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
      <Route path={`${WalletRoutesEnum.sso}/:data`} component={WalletSSOPage} />
      <Route exact path={WalletRoutesEnum.root} component={MyAssets} />
    </Switch>
  );
};

export const AppRoutes = AppRoutesComponent;
