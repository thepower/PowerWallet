import React, { useEffect } from 'react';
import { FullScreenLoader, ShallowPageTemplate, TopBar } from 'common';
import { Route, Switch } from 'react-router-dom';
import { AddAssetsPage } from 'myAssets/pages/AddAssets/AddAssetsPage';
import { AssetTransactionsPage } from 'myAssets/pages/AssetTransactions/AssetTransactionsPage';
import { AssetSelectionPage } from 'myAssets/pages/AssetSelection/AssetSelectionPage';
import AssetsSection from './AssetsSection';
import { useAppDispatch, useAppSelector } from '../../application/store';
import { loadBalanceTrigger } from '../../myAssets/slices/walletSlice';
import { checkIfLoading } from '../../network/selectors';
import { RoutesEnum } from '../../application/typings/routes';
import MyAssets from '../../myAssets/components/MyAssets';
import styles from './Home.module.scss';
import Send from '../../send/components/Send';

const Home = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => checkIfLoading(state, loadBalanceTrigger.type));

  useEffect(() => {
    dispatch(loadBalanceTrigger());
  }, [dispatch]);

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <Switch>
      <Route path={`${RoutesEnum.myAssets}/:type/:address${RoutesEnum.send}`} component={Send} />
      <Route path={`${RoutesEnum.myAssets}${RoutesEnum.add}`}>
        <AddAssetsPage />
      </Route>
      <Route
        path={`${RoutesEnum.myAssets}/:type/:address${RoutesEnum.transactions}`}
        component={AssetTransactionsPage}
      />
      <Route
        path={`${RoutesEnum.myAssets}${RoutesEnum.assetSelection}`}
        component={AssetSelectionPage}
      />
      <Route path={RoutesEnum.myAssets}>
        <MyAssets />
      </Route>
      <Route path={RoutesEnum.root}>
        <ShallowPageTemplate>
          <TopBar type="shallow" />
          <div className={styles.content}>
            <AssetsSection />
          </div>
        </ShallowPageTemplate>
      </Route>
    </Switch>
  );
};

export default Home;
