import React, {
  useState, useEffect, useMemo, useCallback,
} from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  Button, Divider, PageTemplate, Tabs,
} from 'common';
import { RootState } from 'application/store';
import { WalletRoutesEnum } from 'application/typings/routes';
import {
  getErc721Tokens,
  getTokenByID,
  getTokens,
} from 'myAssets/selectors/tokensSelectors';
import {
  getWalletNativeTokens,
  getWalletNativeTokensAmountBySymbol,
} from 'myAssets/selectors/walletSelectors';
import {
  getErc721TokensTrigger,
  toggleTokenShow,
  updateTokensAmountsTrigger,
} from 'myAssets/slices/tokensSlice';

import { useTranslation } from 'react-i18next';
import { Link, RouteComponentProps } from 'react-router-dom';
import { MyAssetsTabs, TokenKind, getMyAssetsTabsLabels } from 'myAssets/types';
import { Token } from 'myAssets/components/Token';
import { push } from 'connected-react-router';
import { Erc721Token } from 'myAssets/components/Erc721Token';
import { checkIfLoading } from 'network/selectors';
import { range } from 'lodash';
import { Skeleton } from '@mui/material';
import styles from './TokenSelectionPage.module.scss';

type OwnProps = RouteComponentProps<{ address: string }>;

const mapDispatchToProps = {
  toggleTokenShow,
  updateTokensAmountsTrigger,
  pushTo: push,
  getErc721TokensTrigger,
};

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  collectionAddress: props?.match?.params?.address,
  nativeTokens: getWalletNativeTokens(state),
  tokens: getTokens(state),
  erc721Tokens: getErc721Tokens(state),
  isGetErc721TokensLoading: checkIfLoading(state, getErc721TokensTrigger.type),
  getTokenByID: (address: string) => getTokenByID(state, address),
  getWalletNativeTokensAmountBySymbol: (address: string) => getWalletNativeTokensAmountBySymbol(state, address),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type TokenSelectionPageProps = ConnectedProps<typeof connector>;

const TokenSelectionPageComponent: React.FC<TokenSelectionPageProps> = ({
  tokens: erc20Tokens,
  getTokenByID,
  getWalletNativeTokensAmountBySymbol,
  nativeTokens,
  updateTokensAmountsTrigger,
  collectionAddress,
  erc721Tokens,
  isGetErc721TokensLoading,
  getErc721TokensTrigger,
}) => {
  const [tab, setTab] = useState<MyAssetsTabs>(MyAssetsTabs.Erc20);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const { t } = useTranslation();

  useEffect(() => {
    updateTokensAmountsTrigger();
  }, []);

  useEffect(() => {
    if (collectionAddress) {
      getErc721TokensTrigger({ address: collectionAddress });
    }
  }, [collectionAddress, getErc721TokensTrigger]);

  const collection = useMemo(() => {
    if (collectionAddress) {
      return getTokenByID(collectionAddress);
    }
    return null;
  }, [collectionAddress, getTokenByID]);

  const onClickCheckBox = useCallback(
    (token: string) => {
      setSelectedToken((prevState) => (prevState === token ? '' : token));
    },
    [setSelectedToken],
  );

  const tokens = useMemo(
    () => [...nativeTokens, ...erc20Tokens],
    [nativeTokens, erc20Tokens],
  );

  const erc20tokens = tokens.filter(
    (token) => token.isShow && token.type === TokenKind.Erc20,
  );
  const erc721tokens = tokens.filter(
    (token) => token.isShow && token.type === TokenKind.Erc721,
  );

  const tokensMap = {
    [MyAssetsTabs.Erc20]: [...nativeTokens, ...erc20tokens],
    [MyAssetsTabs.Erc721]: erc721tokens,
  };

  const currentTokens = tokensMap[tab];

  const onChangeTab = (_event: React.SyntheticEvent, value: MyAssetsTabs) => {
    setTab(value);
  };
  const renderAssetsList = useCallback(() => {
    if (isGetErc721TokensLoading) {
      return (
        <ul className={styles.tokensList}>
          {range(0, 10).map((item) => (
            <li key={item}>
              <Skeleton
                key={item}
                height={60}
                sx={{
                  transform: 'none',
                  transformOrigin: 'unset',
                  borderRadius: '5px',
                  mt: '40px',
                  mb: '32px',
                }}
              />
              <Divider />
            </li>
          ))}
        </ul>
      );
    }

    if (collectionAddress) {
      return (
        <ul className={styles.tokensList}>
          {erc721Tokens.map((token) => (
            <li key={token.id}>
              <Erc721Token
                collection={collection!}
                token={token}
                isCheckBoxChecked={selectedToken === token.id}
                onClickCheckBox={onClickCheckBox}
              />
            </li>
          ))}
        </ul>
      );
    }

    return (
      <ul className={styles.tokensList}>
        {currentTokens.map((token) => (
          <li key={token.address}>
            <Token
              token={token}
              isCheckBoxChecked={
                token.type === TokenKind.Native
                  ? selectedToken === token.symbol
                  : selectedToken === token.address
              }
              onClickCheckBox={onClickCheckBox}
              isErc721Collection={tab === MyAssetsTabs.Erc721}
            />
          </li>
        ))}
      </ul>
    );
  }, [
    collectionAddress,
    currentTokens,
    erc721Tokens,
    collection,
    selectedToken,
    onClickCheckBox,
    tab,
    isGetErc721TokensLoading,
  ]);

  const nativeAssetAmount = getWalletNativeTokensAmountBySymbol(selectedToken);
  const token = getTokenByID(selectedToken);

  const assetIdentifier = useMemo(() => {
    if (collectionAddress) {
      return collection?.address;
    }
    if (nativeAssetAmount) {
      return selectedToken;
    }
    return token?.address || '';
  }, [
    collectionAddress,
    collection?.address,
    nativeAssetAmount,
    selectedToken,
    token?.address,
  ]);

  const tokenType = nativeAssetAmount
    ? TokenKind.Native
    : token?.type || collection?.type || '';

  const nextLink =
    tokenType === TokenKind.Erc721
      ? `/${tokenType}/${assetIdentifier}/${selectedToken}${WalletRoutesEnum.send}`
      : `/${tokenType}/${assetIdentifier}${WalletRoutesEnum.send}`;

  return (
    <PageTemplate
      topBarChild={t('tokenSelection')}
      backUrl="/"
      backUrlText={t('home')!}
    >
      <div className={styles.tokenSelection}>
        {!collectionAddress && <Tabs
          tabs={MyAssetsTabs}
          tabsLabels={getMyAssetsTabsLabels()}
          value={tab}
          onChange={onChangeTab}
          tabsRootClassName={styles.myAssetsTabsRoot}
          tabIndicatorClassName={styles.myAssetsTabIndicator}
          tabSelectedClassName={styles.myAssetsTabSelected}
        />}
        <div className={styles.tokens}>{renderAssetsList()}</div>
        <Link to={nextLink}>
          <Button
            disabled={!token && !nativeAssetAmount && !selectedToken}
            className={styles.tokenSelectionFixedButton}
            variant="contained"
          >
            {t('next')}
          </Button>
        </Link>
      </div>
    </PageTemplate>
  );
};

export const TokenSelectionPage = connector(TokenSelectionPageComponent);
