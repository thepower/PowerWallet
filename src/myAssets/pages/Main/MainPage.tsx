import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import omit from 'lodash/omit';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import appEnvs from 'appEnvs';
import { RoutesEnum } from 'application/typings/routes';
import {
  useTokensStore,
  useWalletsStore
} from 'application/utils/localStorageUtils';
import {
  FaucetSvg,
  SendSvg,
  ServerCogIcon
  // VestingSvg
} from 'assets/icons';
import { CardLink, PageTemplate, Tabs, SearchInput } from 'common';
import hooks from 'hooks';
import WalletCard from 'myAssets/components/WalletCard/WalletCard';
import { useWalletData } from 'myAssets/hooks/useWalletData';
import { MyAssetsTabs, TokenKind, getMyAssetsTabsLabels } from 'myAssets/types';
import styles from './MainPage.module.scss';
import AddButton from '../../components/AddButton';
import { Token } from '../../components/Token';

const MainPageComponent: FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { scrollContainerRef, scrollToElementByIndex } =
    hooks.useSmoothHorizontalScroll();

  const [tab, setTab] = useState<MyAssetsTabs>(MyAssetsTabs.Erc20);
  const { activeWallet, wallets } = useWalletsStore();

  const walletsWithActiveWalletAtFirst = useMemo(() => {
    let filteredWallets = wallets;
    if (searchTerm) {
      filteredWallets = wallets.filter((wallet) => {
        const walletWithoutEncryptedWif = omit(wallet, 'encryptedWif');
        return JSON.stringify(walletWithoutEncryptedWif).includes(searchTerm);
      });
    }

    if (activeWallet) {
      const activeWalletInFiltered = filteredWallets.find(
        (w) => w.address === activeWallet.address
      );
      if (activeWalletInFiltered) {
        return [
          activeWallet,
          ...filteredWallets.filter(
            (wallet) => wallet.address !== activeWallet.address
          )
        ];
      }
    }
    return filteredWallets;
  }, [activeWallet, wallets, searchTerm]);

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    []
  );

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
  }, [scrollContainerRef]);

  const renderWallets = useCallback(() => {
    return (
      <div ref={scrollContainerRef} className={styles.wallets}>
        {walletsWithActiveWalletAtFirst.map((wallet) => (
          <WalletCard
            key={wallet.address}
            wallet={wallet}
            onSelectWallet={() => {
              scrollToElementByIndex(0);
              setSearchTerm('');
            }}
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
        {wallets.length > 2 && (
          <div className={styles.searchWrapper}>
            <SearchInput
              value={searchTerm}
              onChange={handleSearch}
              onClickSearch={() => {}}
              className={styles.searchInput}
            />
          </div>
        )}
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
          {/* <CardLink
            to={RoutesEnum.vesting}
            label={t('vesting')}
            target={'_self'}
            rel='noreferrer'
          >
            <VestingSvg />
          </CardLink> */}
          <CardLink
            to={RoutesEnum.claimNode}
            label={t('claimNode')}
            target={'_self'}
            rel='noreferrer'
          >
            <ServerCogIcon />
          </CardLink>
          {/* <CardLink to={RoutesEnum.buy} label={t('deposit')} target={'_self'}>
            <BuySvg />
          </CardLink> */}
        </div>
        {/* <div className={styles.btnWrapper}>
          <Button
            to={RoutesEnum.referralProgram}
            className={styles.referralBtn}
            variant='contained'
          >
            {t('inviteFriendsEarnRewards')}
          </Button>
        </div> */}
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
