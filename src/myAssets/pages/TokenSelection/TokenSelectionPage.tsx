import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Skeleton } from '@mui/material';
import range from 'lodash/range';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { WalletRoutesEnum } from 'application/typings/routes';
import { useTokens, useWallets } from 'application/utils/localStorageUtils';
import { Button, Divider, PageTemplate, Tabs } from 'common';
import { Erc721Token } from 'myAssets/components/Erc721Token';
import { Token } from 'myAssets/components/Token';
import { useERC721Tokens } from 'myAssets/hooks/useERC721Tokens';
import { useWalletData } from 'myAssets/hooks/useWalletData';

import { MyAssetsTabs, TokenKind, getMyAssetsTabsLabels } from 'myAssets/types';
import styles from './TokenSelectionPage.module.scss';

const TokenSelectionPageComponent: React.FC = () => {
  const [tab, setTab] = useState<MyAssetsTabs>(MyAssetsTabs.Erc20);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const { t } = useTranslation();
  const { address: collectionAddress } = useParams<{ address: string }>();

  const { activeWallet } = useWallets();
  const { nativeTokens, getNativeTokenAmountBySymbol } =
    useWalletData(activeWallet);

  const { erc721Tokens, isLoading: isGetErc721TokensLoading } = useERC721Tokens(
    { tokenAddress: collectionAddress }
  );

  const { tokens, getTokenByAddress } = useTokens();
  useEffect(() => {
    // updateTokensAmountsTrigger();
  }, []);

  useEffect(() => {
    if (collectionAddress) {
      // getErc721TokensTrigger({ address: collectionAddress });
    }
  }, [collectionAddress]);

  const collection = useMemo(() => {
    if (collectionAddress) {
      return getTokenByAddress(collectionAddress);
    }
    return null;
  }, [collectionAddress, getTokenByAddress]);

  const onClickCheckBox = useCallback(
    (token: string) => {
      setSelectedToken((prevState) => (prevState === token ? '' : token));
    },
    [setSelectedToken]
  );

  const erc20tokens = tokens.filter(
    (token) =>
      token.isShow &&
      token.type === TokenKind.Erc20 &&
      token?.chainId === activeWallet?.chainId
  );
  const erc721tokens = tokens.filter(
    (token) =>
      token.isShow &&
      token.type === TokenKind.Erc721 &&
      token?.chainId === activeWallet?.chainId
  );

  const tokensMap = {
    [MyAssetsTabs.Erc20]: [...nativeTokens, ...erc20tokens],
    [MyAssetsTabs.Erc721]: erc721tokens
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
                  mb: '32px'
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
          {erc721Tokens &&
            erc721Tokens.map((token) => (
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
    isGetErc721TokensLoading
  ]);

  const nativeAssetAmount = getNativeTokenAmountBySymbol(selectedToken);
  const token = getTokenByAddress(selectedToken);

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
    token?.address
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
      backUrl='/'
      backUrlText={t('home')!}
    >
      <div className={styles.tokenSelection}>
        {!collectionAddress && (
          <Tabs
            tabs={MyAssetsTabs}
            tabsLabels={getMyAssetsTabsLabels()}
            value={tab}
            onChange={onChangeTab}
            tabsRootClassName={styles.myAssetsTabsRoot}
            tabIndicatorClassName={styles.myAssetsTabIndicator}
            tabSelectedClassName={styles.myAssetsTabSelected}
          />
        )}
        <div className={styles.tokens}>{renderAssetsList()}</div>
        <Link to={nextLink}>
          <Button
            disabled={!token && !nativeAssetAmount && !selectedToken}
            className={styles.tokenSelectionFixedButton}
            variant='contained'
          >
            {t('next')}
          </Button>
        </Link>
      </div>
    </PageTemplate>
  );
};

export const TokenSelectionPage = TokenSelectionPageComponent;
