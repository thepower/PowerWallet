import React, { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';
import { Link } from 'react-router-dom';
import appEnvs from 'appEnvs';
import { RootState } from 'application/reduxStore';
import { setIsShowUnderConstruction } from 'application/store';
import { WalletRoutesEnum } from 'application/typings/routes';
import { useWallets } from 'application/utils/localStorageUtils';
import { BuySvg, FaucetSvg, LogoIcon, SendSvg } from 'assets/icons';
import { Button, CardLink, CopyButton, PageTemplate, Tabs } from 'common';
import { useWalletData } from 'myAssets/hooks/useWalletData';
import { getTokens } from 'myAssets/selectors/tokensSelectors';
import { updateTokensAmountsTrigger } from 'myAssets/slices/tokensSlice';
import { MyAssetsTabs, TokenKind, getMyAssetsTabsLabels } from 'myAssets/types';
import styles from './MainPage.module.scss';
import AddButton from '../../components/AddButton';
import { Token } from '../../components/Token';
import { getWalletNativeTokens } from '../../selectors/walletSelectors';

const mapDispatchToProps = {
  updateTokensAmountsTrigger
};

const mapStateToProps = (state: RootState) => ({
  nativeTokens: getWalletNativeTokens(state),
  tokens: getTokens(state)
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type MainPageProps = ConnectedProps<typeof connector>;

const MainPageComponent: FC<MainPageProps> = ({
  nativeTokens,
  tokens,
  updateTokensAmountsTrigger
}) => {
  const { t } = useTranslation();

  const [tab, setTab] = useState<MyAssetsTabs>(MyAssetsTabs.Erc20);
  const { activeWallet } = useWallets();

  const chainId = activeWallet?.chainId;

  const { walletData } = useWalletData();

  useEffect(() => {
    updateTokensAmountsTrigger();
  }, []);

  const onChangeTab = (_event: React.SyntheticEvent, value: MyAssetsTabs) => {
    setTab(value);
  };

  const handleShowUnderConstruction = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsShowUnderConstruction(true);
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
      <ul className={styles.tokensList}>
        {currentTokens.map((token) => (
          <li key={token.address}>
            <Token token={token} />
          </li>
        ))}
      </ul>
    );
  }, [t, currentTokens]);

  return (
    <PageTemplate>
      <div className={styles.wrapper}>
        <div className={styles.account}>
          <div className={styles.title}>{t('accountNumber')}</div>
          <CopyButton
            textButton={activeWallet?.address || ''}
            className={styles.addressButton}
            iconClassName={styles.copyIcon}
          />
          <div className={styles.accountChain}>{`Chain: ${chainId}`}</div>
        </div>
        <div className={styles.panel}>
          <div className={styles.info}>
            <div className={styles.infoTitle}>{t('skBalance')}</div>
            <div className={styles.balance}>
              <LogoIcon className={styles.icon} />
              {!walletData?.amount?.SK || walletData?.amount?.SK === 0 ? (
                <span className={styles.emptyTitle}>
                  {t('yourTokensWillBeHere')}
                </span>
              ) : (
                walletData?.amount?.SK
              )}
            </div>
          </div>
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
              to={WalletRoutesEnum.tokenSelection}
              label={t('send')}
              target={'_self'}
              rel='noreferrer'
            >
              <SendSvg />
            </CardLink>
            <CardLink
              onClick={handleShowUnderConstruction}
              to={WalletRoutesEnum.buy}
              label={t('buy')}
              target={'_self'}
            >
              <BuySvg />
            </CardLink>
          </div>
        </div>
        <div className={styles.btnWrapper}>
          <Button
            to={WalletRoutesEnum.referralProgram}
            className={styles.referralBtn}
            variant='contained'
          >
            {t('inviteFriendsEarnRewards')}
          </Button>
        </div>
        <div className={styles.tokensHeadRow}>
          <div className={styles.title}>{t('tokens')}</div>
          <Link to={`${WalletRoutesEnum.add}`}>
            <AddButton>{t('addToken')}</AddButton>
          </Link>
        </div>
      </div>
      <Tabs
        tabs={MyAssetsTabs}
        tabsLabels={getMyAssetsTabsLabels()}
        value={tab}
        onChange={onChangeTab}
        tabsRootClassName={styles.myAssetsTabsRoot}
      />
      <div className={styles.tokens}>{renderAssetsList()}</div>
    </PageTemplate>
  );
};

export const MainPage = connector(MainPageComponent);
