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
  getWalletNativeTokens,
  getWalletNativeTokensAmountByAddress,
} from 'myAssets/selectors/walletSelectors';
import {
  toggleTokenShow,
  updateTokensAmountsTrigger,
} from 'myAssets/slices/tokensSlice';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './TokenSelectionPage.module.scss';

const mapDispatchToProps = {
  toggleTokenShow,
  updateTokensAmountsTrigger,
};

const mapStateToProps = (state: RootState) => ({
  nativeTokens: getWalletNativeTokens(state),
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
  nativeTokens,
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
      topBarChild={t('tokenSelection')}
      backUrl="/"
      backUrlText={t('home')!}
    >
      <div className={styles.tokenSelection}>
        <div className={styles.tokens}>{renderAssetsList()}</div>
        <Link to={`/${tokenType}/${assetIndetifier}${WalletRoutesEnum.send}`}>
          <Button
            disabled={!token && !nativeAssetAmount}
            className={styles.tokenSelectionFixedButton}
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
