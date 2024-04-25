import { CardLink, PageTemplate, Tabs } from 'common';
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
  TokenPayloadType,
} from 'myAssets/types';
import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { Link } from 'react-router-dom';
import appEnvs from 'appEnvs';
import { useTranslation } from 'react-i18next';
import { setShowUnderConstruction } from '../../application/slice/applicationSlice';
import { RootState } from '../../application/store';
import { WalletRoutesEnum } from '../../application/typings/routes';
import { getWalletNativeTokensAmounts } from '../selectors/walletSelectors';
import AddButton from './AddButton';
import { Asset } from './Asset';
import styles from './MyAssets.module.scss';

const mapDispatchToProps = {
  updateTokensAmountsTrigger,
  setShowUnderConstruction,
};

const mapStateToProps = (state: RootState) => ({
  amounts: getWalletNativeTokensAmounts(state),
  tokens: getTokens(state),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type MyAssetsProps = ConnectedProps<typeof connector>;

const MyAssetsComponent: FC<MyAssetsProps> = ({
  amounts,
  tokens,
  updateTokensAmountsTrigger,
  setShowUnderConstruction,
}) => {
  const { t } = useTranslation();

  const [tab, setTab] = useState<MyAssetsTabs>(MyAssetsTabs.PowerNativeTokens);

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

  const nativeTokens = Object.entries(amounts).map(
    ([symbol, amount]) => ({
      type: 'native',
      name: symbol,
      address: symbol,
      symbol,
      decimals: '9',
      amount,
    } as TokenPayloadType),
  );

  const erc20tokens = tokens.filter((token) => token.isShow);

  const tokensMap = {
    [MyAssetsTabs.PowerNativeTokens]: nativeTokens,
    [MyAssetsTabs.Erc20]: erc20tokens,
    // [MyAssetsTabs.NFT]: [],
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
        {currentTokens.map((asset) => (
          <li key={asset.address}>
            <Asset asset={asset} />
          </li>
        ))}
      </ul>
    );
  }, [t, currentTokens]);

  return (
    <PageTemplate>
      <div className={styles.panel}>
        <div className={styles.info}>
          <p className={styles.title}>{t('totalBalance')}</p>
          <p className={styles.balance}>
            <LogoIcon className={styles.icon} />
            {!amounts?.SK || amounts?.SK === '0' ? (
              <span className={styles.emptyTitle}>
                {t('yourTokensWillBeHere')}
              </span>
            ) : (
              amounts?.SK
            )}
          </p>
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
            to={WalletRoutesEnum.assetSelection}
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
      <Link
        className={styles.myAssetsAddAssetsButton}
        to={`${WalletRoutesEnum.add}`}
      >
        <AddButton>{t('addAssets')}</AddButton>
      </Link>
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
