import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { FullScreenLoader } from 'common';
import { RegistrationPage } from 'registration/components/RegistrationPage';
import { LoginPage } from 'registration/components/pages/LoginPage';
import { checkIfLoading } from 'network/selectors';
import { AddAssetsPage } from 'myAssets/pages/AddAssets/AddAssetsPage';
import { AssetTransactionsPage } from 'myAssets/pages/AssetTransactions/AssetTransactionsPage';
import { AssetSelectionPage } from 'myAssets/pages/AssetSelection/AssetSelectionPage';
import MyAssets from 'myAssets/components/MyAssets';
import Send from 'send/components/Send';
import { WalletHome } from 'home/components/pages/WalletHome';
import SignAndSendPage from 'sign-and-send/components/SingAndSendPage';
import WalletSSOPage from 'sso/components/pages/WalletSSOPage';
import { RegistrationForAppsPage } from 'registration/components/RegistrationForAppsPage';
import { useAppDispatch, useAppSelector } from '../store';
import { WalletRoutesEnum } from '../typings/routes';
import { initApplication } from '../slice/applicationSlice';

const AppRoutesComponent: React.FC = () => {
  const dispatch = useAppDispatch();

  const networkApi = useAppSelector((state) => state.applicationData.networkApi);
  const walletApi = useAppSelector((state) => state.applicationData.walletApi);
  const loading = useAppSelector((state) => checkIfLoading(state, initApplication.type));

  useEffect(() => {
    dispatch(initApplication());
  }, [dispatch]);

  if (!walletApi || !networkApi || loading) {
    return (
      <FullScreenLoader />
    );
  }
  return (
    <Switch>
      <Route exact path={WalletRoutesEnum.signup} component={RegistrationPage} />
      <Route exact path={`${WalletRoutesEnum.registrationForApps}/:data`} component={RegistrationForAppsPage} />
      <Route exact path={WalletRoutesEnum.login} component={LoginPage} />
      <Route path={`${WalletRoutesEnum.myAssets}/:type/:address${WalletRoutesEnum.send}`} component={Send} />
      <Route exact path={`${WalletRoutesEnum.myAssets}${WalletRoutesEnum.add}`}>
        <AddAssetsPage />
      </Route>
      <Route
        path={`${WalletRoutesEnum.myAssets}/:type/:address${WalletRoutesEnum.transactions}`}
        component={AssetTransactionsPage}
      />
      <Route
        path={`${WalletRoutesEnum.myAssets}${WalletRoutesEnum.assetSelection}`}
        component={AssetSelectionPage}
        exact
      />
      <Route path={`${WalletRoutesEnum.myAssets}${WalletRoutesEnum.signAndSend}/:message`} component={SignAndSendPage} />
      <Route exact path={WalletRoutesEnum.myAssets}>
        <MyAssets />
      </Route>
      <Route path={`${WalletRoutesEnum.sso}/:data`} component={WalletSSOPage} />
      <Route exact path={WalletRoutesEnum.root} component={WalletHome} />
    </Switch>
  );
};

export const AppRoutes = AppRoutesComponent;
