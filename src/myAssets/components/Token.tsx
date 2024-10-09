import React, { FC, memo, useMemo } from 'react';
import cn from 'classnames';

import { Link } from 'react-router-dom';
import { WalletRoutesEnum } from 'application/typings/routes';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { LogoIcon } from 'assets/icons';
import { Checkbox, Switch } from 'common';
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
  const { type, address } = token;
  const { activeWallet } = useWalletsStore();

  const { tokenBalance } = useTokenBalance({
    tokenAddress: address,
    type
  });

  const { walletData } = useWalletData(activeWallet);

  const balance = useMemo(
    () =>
      type === TokenKind.Native ? walletData?.amount[address] : tokenBalance,
    [type, walletData?.amount, address, tokenBalance]
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
      ? `${WalletRoutesEnum.tokenSelection}/${token.address}`
      : `/${token.type}/${token.address}${WalletRoutesEnum.transactions}`;
    return (
      <Link to={link} className={styles.asset}>
        {children}
      </Link>
    );
  };

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
          onClick={() => onClickCheckBox(token.address)}
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
          </div>
          {renderRightCol()}
        </div>
      )}
    </>
  );
};

export const Token = memo(TokenComponent);
