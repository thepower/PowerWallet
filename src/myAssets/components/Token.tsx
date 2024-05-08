import React, { FC, memo } from 'react';
import { TToken, TokenKind } from 'myAssets/types';
import cn from 'classnames';
import { Checkbox, Divider, Switch } from 'common';
import { BigNumber, formatFixed } from '@ethersproject/bignumber';

import { Link } from 'react-router-dom';
import { WalletRoutesEnum } from 'application/typings/routes';
import { CheckedIcon, LogoIcon, UnCheckedIcon } from 'assets/icons';
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
  onClickCheckBox,
}) => {
  const { amount, decimals, type } = token;
  const formattedAmount =
    type === TokenKind.Erc20 ? formatFixed(BigNumber.from(amount), decimals) : amount;

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
    return onClickCheckBox ? `${symbol} ${formattedAmount}` : symbol;
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
          checkedIcon={<CheckedIcon />}
          icon={<UnCheckedIcon />}
          disableRipple
        />
      );
    }
    return <span className={styles.amount}>{formattedAmount}</span>;
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
        </div>,
      )}
      <Divider className={styles.divider} />
    </>
  );
};

export const Token = memo(TokenComponent);
