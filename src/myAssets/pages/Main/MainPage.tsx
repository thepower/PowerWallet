import {
  CardLink, CopyButton, PageTemplate, Tabs,
} from 'common';
import {
  BuySvg, FaucetSvg, LogoIcon, SendSvg,
} from 'assets/icons';
import { getTokens } from 'myAssets/selectors/tokensSelectors';
import {
  updateTokensAmountsTrigger,
} from 'myAssets/slices/tokensSlice';
import {
  MyAssetsTabs,
  getMyAssetsTabsLabels,
} from 'myAssets/types';
import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { Link } from 'react-router-dom';
import appEnvs from 'appEnvs';
import { useTranslation } from 'react-i18next';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { getNetworkChainID } from 'application/selectors';
import { setShowUnderConstruction } from 'application/slice/applicationSlice';
import { RootState } from 'application/store';
import { WalletRoutesEnum } from 'application/typings/routes';
import { getWalletNativeTokens, getWalletNativeTokensAmounts } from '../../selectors/walletSelectors';
import AddButton from '../../components/AddButton';
import { Token } from '../../components/Token';
import styles from './MainPage.module.scss';

const mapDispatchToProps = {
  updateTokensAmountsTrigger,
  setShowUnderConstruction,
};

const mapStateToProps = (state: RootState) => ({
  amounts: getWalletNativeTokensAmounts(state),
  nativeTokens: getWalletNativeTokens(state),
  tokens: getTokens(state),
  walletAddress: getWalletAddress(state),
  chainId: getNetworkChainID(state),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type MyAssetsProps = ConnectedProps<typeof connector>;

const MyAssetsComponent: FC<MyAssetsProps> = ({
  amounts,
  nativeTokens,
  tokens,
  chainId,
  updateTokensAmountsTrigger,
  setShowUnderConstruction,
  walletAddress,
}) => {
  const { t } = useTranslation();

  const [tab, setTab] = useState<MyAssetsTabs>(MyAssetsTabs.Erc20);

  useEffect(() => {
    updateTokensAmountsTrigger();
  }, []);

  const onChangeTab = (_event: React.SyntheticEvent, value: MyAssetsTabs) => {
    setTab(value);
  };

  const handleShowUnderConstruction = (event: React.MouseEvent) => {
    event.preventDefault();
    setShowUnderConstruction(true);
  };

  const erc20tokens = tokens.filter((token) => token.isShow && token.type === 'erc20');
  const erc721tokens = tokens.filter((token) => token.isShow && token.type === 'erc721');

  const tokensMap = {
    [MyAssetsTabs.Erc20]: [...nativeTokens, ...erc20tokens],
    [MyAssetsTabs.Erc721]: erc721tokens,
  };

  const currentTokens = tokensMap[tab];

  const renderAssetsList = useCallback(() => {
    if (!currentTokens.length) {
      return (
        <div className={styles.noTokens}>
          {t('yourTokensWillBeHere')}
        </div>
      );
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
            textButton={walletAddress}
            className={styles.addressButton}
            iconClassName={styles.copyIcon}
          />
          <div className={styles.accountChain}>
            {`Chain: ${chainId}`}
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.info}>
            <div className={styles.infoTitle}>{t('skBalance')}</div>
            <div className={styles.balance}>
              <LogoIcon className={styles.icon} />
              {!amounts?.SK || amounts?.SK === '0' ? (
                <span className={styles.emptyTitle}>
                  {t('yourTokensWillBeHere')}
                </span>
              ) : (
                amounts?.SK
              )}
            </div>
          </div>
          <div className={styles.linksGroup}>
            <CardLink
              label={t('faucet')}
              isAnchor
              to={appEnvs.FAUCET_THEPOWER_URL}
              target="_blank"
              rel="noreferrer"
            >
              <FaucetSvg />
            </CardLink>
            <CardLink
              to={WalletRoutesEnum.tokenSelection}
              label={t('send')}
              target={'_self'}
              rel="noreferrer"
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
        <div className={styles.tokensHeadRow}>
          <div className={styles.title}>{t('tokens')}</div>
          <Link
            to={`${WalletRoutesEnum.add}`}
          >
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
        tabsHolderClassName={styles.myAssetsTabsHolder}
        tabClassName={styles.myAssetsTab}
        tabIndicatorClassName={styles.myAssetsTabIndicator}
        tabSelectedClassName={styles.myAssetsTabSelected}
      />
      <div className={styles.tokens}>
        {renderAssetsList()}
      </div>
    </PageTemplate>
  );
};

export const MyAssets = connector(MyAssetsComponent);
