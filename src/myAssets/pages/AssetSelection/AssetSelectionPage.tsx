import React, {
  useState, useEffect, useMemo, useCallback,
} from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Button, PageTemplate } from 'common';
import { RootState } from 'application/store';
import { WalletRoutesEnum } from 'application/typings/routes';
import { Asset } from 'myAssets/components/Asset';
import { getTokenByID, getTokens } from 'myAssets/selectors/tokensSelectors';
import {
  getWalletNativeTokensAmountByID,
  getWalletNativeTokensAmounts,
} from 'myAssets/selectors/walletSelectors';
import {
  addTokenTrigger,
  toggleTokenShow,
  updateTokensAmountsTrigger,
} from 'myAssets/slices/tokensSlice';
import { TokenPayloadType } from 'myAssets/types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './AssetSelectionPage.module.scss';

const mapDispatchToProps = {
  addTokenTrigger,
  toggleTokenShow,
  updateTokensAmountsTrigger,
};

const mapStateToProps = (state: RootState) => ({
  amounts: getWalletNativeTokensAmounts(state),
  tokens: getTokens(state),
  getTokenByID: (address: string) => getTokenByID(state, address),
  getWalletNativeTokensAmountByID: (symbol: string) => getWalletNativeTokensAmountByID(state, symbol),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type AssetSelectionPageProps = ConnectedProps<typeof connector>;

const AssetSelectionPageComponent: React.FC<AssetSelectionPageProps> = ({
  tokens: erc20Tokens,
  getTokenByID,
  getWalletNativeTokensAmountByID,
  amounts,
  updateTokensAmountsTrigger,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const { t } = useTranslation();

  useEffect(() => {
    updateTokensAmountsTrigger();
  }, []);

  const onClickCheckBox = useCallback(
    (value: string) => {
      setSelectedAsset((prevState) => (prevState === value ? '' : value));
    },
    [setSelectedAsset],
  );

  const nativeTokens = useMemo(
    () => Object.entries(amounts).map(
      ([symbol, amount]) => ({
        type: 'native',
        name: symbol,
        address: symbol,
        symbol,
        decimals: '9',
        amount,
      } as TokenPayloadType),
    ),
    [amounts],
  );

  const tokens = useMemo(
    () => [...nativeTokens, ...erc20Tokens],
    [nativeTokens, erc20Tokens],
  );

  const renderAssetsList = useCallback(
    () => (
      <ul className={styles.tokensList}>
        {tokens.map((token) => (
          <li key={token.address}>
            <Asset
              asset={token}
              isCheckBoxChecked={
                token.type === 'native'
                  ? selectedAsset === token.symbol
                  : selectedAsset === token.address
              }
              onClickCheckBox={onClickCheckBox}
            />
          </li>
        ))}
      </ul>
    ),
    [tokens, selectedAsset, onClickCheckBox],
  );

  const nativeAssetAmount = getWalletNativeTokensAmountByID(selectedAsset);
  const asset = getTokenByID(selectedAsset);
  const assetIndetifier = nativeAssetAmount
    ? selectedAsset
    : asset?.address || '';
  const assetType = nativeAssetAmount ? 'native' : asset?.type || '';

  return (
    <PageTemplate
      topBarChild={t('assetSelection')}
      backUrl="/"
      backUrlText={t('myAssets')!}
    >
      <div className={styles.assetSelection}>
        <div className={styles.tokens}>{renderAssetsList()}</div>
        <Link to={`/${assetType}/${assetIndetifier}${WalletRoutesEnum.send}`}>
          <Button
            disabled={!asset && !nativeAssetAmount}
            className={styles.assetSelectionFixedButton}
            variant="filled"
          >
            {t('next')}
          </Button>
        </Link>
      </div>
    </PageTemplate>
  );
};

export const AssetSelectionPage = connector(AssetSelectionPageComponent);
