import React, {
  useState, useEffect, useMemo, useCallback,
} from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Button, PageTemplate } from 'common';
import { RootState } from 'application/store';
import { WalletRoutesEnum } from 'application/typings/routes';
import { Token } from 'myAssets/components/Token';
import { getTokenByID, getTokens } from 'myAssets/selectors/tokensSelectors';
import {
  getWalletNativeTokensAmountByAddress,
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
import styles from './TokenSelectionPage.module.scss';

const mapDispatchToProps = {
  addTokenTrigger,
  toggleTokenShow,
  updateTokensAmountsTrigger,
};

const mapStateToProps = (state: RootState) => ({
  amounts: getWalletNativeTokensAmounts(state),
  tokens: getTokens(state),
  getTokenByID: (address: string) => getTokenByID(state, address),
  getWalletNativeTokensAmountByAddress: (address: string) => getWalletNativeTokensAmountByAddress(state, address),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type TokenSelectionPageProps = ConnectedProps<typeof connector>;

const TokenSelectionPageComponent: React.FC<TokenSelectionPageProps> = ({
  tokens: erc20Tokens,
  getTokenByID,
  getWalletNativeTokensAmountByAddress,
  amounts,
  updateTokensAmountsTrigger,
}) => {
  const [selectedToken, setSelectedToken] = useState<string>('');
  const { t } = useTranslation();
  useEffect(() => {
    updateTokensAmountsTrigger();
  }, []);

  const onClickCheckBox = useCallback(
    (value: string) => {
      setSelectedToken((prevState) => (prevState === value ? '' : value));
    },
    [setSelectedToken],
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
            <Token
              token={token}
              isCheckBoxChecked={
                token.type === 'native'
                  ? selectedToken === token.symbol
                  : selectedToken === token.address
              }
              onClickCheckBox={onClickCheckBox}
            />
          </li>
        ))}
      </ul>
    ),
    [tokens, selectedToken, onClickCheckBox],
  );

  const nativeAssetAmount = getWalletNativeTokensAmountByAddress(selectedToken);
  const token = getTokenByID(selectedToken);
  const assetIndetifier = nativeAssetAmount
    ? selectedToken
    : token?.address || '';
  const tokenType = nativeAssetAmount ? 'native' : token?.type || '';

  return (
    <PageTemplate
      topBarChild={t('assetSelection')}
      backUrl="/"
      backUrlText={t('home')!}
    >
      <div className={styles.assetSelection}>
        <div className={styles.tokens}>{renderAssetsList()}</div>
        <Link to={`/${tokenType}/${assetIndetifier}${WalletRoutesEnum.send}`}>
          <Button
            disabled={!token && !nativeAssetAmount}
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

export const TokenSelectionPage = connector(TokenSelectionPageComponent);
