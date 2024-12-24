import React, { FC, memo, useMemo } from 'react';
import cn from 'classnames';

import { useNavigate } from 'react-router-dom';
import { RoutesEnum } from 'application/typings/routes';
import { sliceString } from 'application/utils/applicationUtils';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { LogoIcon } from 'assets/icons';
import { Checkbox, CopyButton, Switch } from 'common';
import { useTokenBalance } from 'myAssets/hooks/useTokenBalance';
import { useWalletData } from 'myAssets/hooks/useWalletData';
import { TokenKind, TToken } from 'myAssets/types';
import styles from './Token.module.scss';

type OwnProps = {
  token: TToken;
  isCheckBoxChecked?: boolean;
  isErc721Collection?: boolean;
  onClickSwitch?: (checked: boolean) => void;
  onClickCheckBox?: (value: string) => void;
};

type TokenProps = OwnProps;

const TokenComponent: FC<TokenProps> = ({
  token,
  isCheckBoxChecked,
  isErc721Collection,
  onClickSwitch,
  onClickCheckBox
}) => {
  const navigate = useNavigate();
  const { type, address } = token;
  const { activeWallet } = useWalletsStore();

  const { tokenBalance } = useTokenBalance({
    tokenAddress: address,
    type
  });

  const { getNativeTokenAmountBySymbol } = useWalletData(activeWallet);
  const isNativeToken = type === TokenKind.Native;
  const balance = useMemo(
    () =>
      isNativeToken
        ? getNativeTokenAmountBySymbol(address)?.formattedAmount || '0'
        : tokenBalance,
    [isNativeToken, getNativeTokenAmountBySymbol, address, tokenBalance]
  );

  const onClickToken = () => {
    if (onClickSwitch) {
      onClickSwitch(!token.isShow);
    }
    if (onClickCheckBox) {
      if (!isErc721Collection) {
        onClickCheckBox(token.address);
      }
    }
  };

  const renderWrapper = (children: React.ReactNode) => {
    if ((onClickSwitch || onClickCheckBox) && !isErc721Collection) {
      return (
        <div onClick={onClickToken} className={styles.asset}>
          {children}
        </div>
      );
    }
    const link = isErc721Collection
      ? `${RoutesEnum.tokenSelection}/${token.address}`
      : `/${token.type}/${token.address}${RoutesEnum.transactions}`;
    return (
      <div className={styles.asset} onClick={() => navigate(link)}>
        {children}
      </div>
    );
  };

  // if (!balance || balance === '0') return null;

  const renderSymbol = () => {
    const { symbol } = token;
    return onClickCheckBox ? `${symbol} ${balance}` : symbol;
  };

  const renderIcon = () => {
    switch (token.address) {
      case 'SK':
        return <LogoIcon />;

      default:
        return <div />;
    }
  };

  const renderRightCol = () => {
    if (onClickSwitch) {
      return <Switch className={styles.assetSwitch} checked={token.isShow} />;
    }
    if (onClickCheckBox && !isErc721Collection) {
      return (
        <Checkbox
          className={styles.assetCheckBox}
          size={'medium'}
          checked={isCheckBoxChecked}
          onClick={(e) => {
            e?.stopPropagation();
            onClickCheckBox(token.address);
          }}
          disableRipple
        />
      );
    }
    return <span className={styles.amount}>{balance}</span>;
  };

  return (
    <>
      {renderWrapper(
        <div className={styles.row}>
          <div className={cn(styles.icon)}>{renderIcon()}</div>
          <div className={styles.info}>
            <span className={styles.symbol}>{renderSymbol()}</span>
            <span className={styles.name}>{token?.name}</span>
            {!isNativeToken && (
              <CopyButton
                textButton={sliceString(token.address, 8)}
                copyInfo={token.address}
                className={styles.address}
                iconClassName={styles.copyIcon}
              />
            )}
          </div>
          {renderRightCol()}
        </div>
      )}
    </>
  );
};

export const Token = memo(TokenComponent);
