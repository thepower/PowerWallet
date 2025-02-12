import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import appEnvs from 'appEnvs';
import { RoutesEnum } from 'application/typings/routes';
import {
  useTokensStore,
  useWalletsStore
} from 'application/utils/localStorageUtils';
import { BuySvg, FaucetSvg, SendSvg } from 'assets/icons';
import { Button, CardLink, PageTemplate, Tabs } from 'common';
import hooks from 'hooks';
import WalletCard from 'myAssets/components/WalletCard/WalletCard';
import { useWalletData } from 'myAssets/hooks/useWalletData';
import { MyAssetsTabs, TokenKind, getMyAssetsTabsLabels } from 'myAssets/types';
import styles from './MainPage.module.scss';
import AddButton from '../../components/AddButton';
import { Token } from '../../components/Token';

const MainPageComponent: FC = () => {
  const { t } = useTranslation();

  const { scrollContainerRef, scrollToElementByIndex } =
    hooks.useSmoothHorizontalScroll();

  const [tab, setTab] = useState<MyAssetsTabs>(MyAssetsTabs.Erc20);
  const { activeWallet, wallets } = useWalletsStore();

  const walletsWithActiveWalletAtFirst = useMemo(() => {
    if (activeWallet) {
      return [
        activeWallet,
        ...wallets.filter((wallet) => wallet.address !== activeWallet.address)
      ];
    }
    return wallets;
  }, [activeWallet, wallets]);

  const chainId = activeWallet?.chainId;

  const { nativeTokens } = useWalletData(activeWallet);

  const { tokens } = useTokensStore();

  const onChangeTab = (_event: React.SyntheticEvent, value: MyAssetsTabs) => {
    setTab(value);
  };

  const erc20tokens = tokens.filter(
    (token) =>
      token.isShow &&
      token.type === TokenKind.Erc20 &&
      token?.chainId === chainId
  );
  const erc721tokens = tokens.filter(
    (token) =>
      token.isShow &&
      token.type === TokenKind.Erc721 &&
      token?.chainId === chainId
  );

  const tokensMap = {
    [MyAssetsTabs.Erc20]: [...nativeTokens, ...erc20tokens],
    [MyAssetsTabs.Erc721]: erc721tokens
  };

  const currentTokens = tokensMap[tab];

  const renderAssetsList = useCallback(() => {
    if (!currentTokens.length) {
      return <div className={styles.noTokens}>{t('yourTokensWillBeHere')}</div>;
    }

    return (
      <ul>
        {currentTokens.map((token) => (
          <li key={token.address}>
            <Token token={token} />
          </li>
        ))}
      </ul>
    );
  }, [t, currentTokens]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && scrollContainerRef.current) {
        e.preventDefault();
        scrollContainerRef.current.scrollLeft += e.deltaY;
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('wheel', handleWheel);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const renderWallets = useCallback(() => {
    return (
      <div ref={scrollContainerRef} className={styles.wallets}>
        {walletsWithActiveWalletAtFirst.map((wallet) => (
          <WalletCard
            key={wallet.address}
            wallet={wallet}
            onSelectWallet={() => scrollToElementByIndex(0)}
          />
        ))}
      </div>
    );
  }, [
    scrollContainerRef,
    scrollToElementByIndex,
    walletsWithActiveWalletAtFirst
  ]);

  return (
    <PageTemplate>
      <div className={styles.wrapper}>
        {renderWallets()}
        <div className={styles.linksGroup}>
          <CardLink
            label={t('faucet')}
            isAnchor
            to={appEnvs.FAUCET_THEPOWER_URL}
            target='_blank'
            rel='noreferrer'
          >
            <FaucetSvg />
          </CardLink>
          <CardLink
            to={RoutesEnum.tokenSelection}
            label={t('send')}
            target={'_self'}
            rel='noreferrer'
          >
            <SendSvg />
          </CardLink>
          {/* <CardLink to={RoutesEnum.buy} label={t('deposit')} target={'_self'}>
            <BuySvg />
          </CardLink> */}
        </div>
        <div className={styles.btnWrapper}>
          <Button
            to={RoutesEnum.referralProgram}
            className={styles.referralBtn}
            variant='contained'
          >
            {t('inviteFriendsEarnRewards')}
          </Button>
        </div>
        <div className={styles.tokensHeadRow}>
          <div className={styles.title}>{t('tokens')}</div>
          <Link to={`${RoutesEnum.add}`}>
            <AddButton>{t('addToken')}</AddButton>
          </Link>
        </div>
        <Tabs
          tabs={MyAssetsTabs}
          tabsLabels={getMyAssetsTabsLabels()}
          value={tab}
          onChange={onChangeTab}
          tabsRootClassName={styles.myAssetsTabsRoot}
        />
        {renderAssetsList()}
      </div>
    </PageTemplate>
  );
};

export const MainPage = MainPageComponent;
