import React, { FC, memo } from 'react';
import { TokenType } from 'myAssets/slices/tokensSlice';
import cn from 'classnames';
import { Checkbox, Divider, Switch } from 'common';
import { BigNumber, formatFixed } from '@ethersproject/bignumber';

import { Link } from 'react-router-dom';
import { WalletRoutesEnum } from 'application/typings/routes';
import { CheckedIcon, LogoIcon, UnCheckedIcon } from 'assets/icons';
import styles from './Token.module.scss';

type OwnProps = {
  token: TokenType,
  isCheckBoxChecked?: boolean,
  onClickSwitch?: (checked: boolean) => void,
  onClickCheckBox?: (value: string) => void
};

type TokenProps = OwnProps;

const TokenComponent: FC<TokenProps> = ({
  token, isCheckBoxChecked, onClickSwitch, onClickCheckBox,
}) => {
  const { amount, decimals, type } = token;
  const formattedAmount = type === 'erc20'
    ? formatFixed(BigNumber.from(amount), decimals)
    : amount;

  const onClickToken = () => {
    if (onClickSwitch) {
      onClickSwitch(!token.isShow);
    }
    if (onClickCheckBox) {
      onClickCheckBox(token.address);
    }
  };

  const renderWrapper = (children: React.ReactNode) => (onClickSwitch || onClickCheckBox ?
    <div onClick={onClickToken} className={styles.asset}>{children}</div>
    : <Link
        to={`/${token.type}/${token.address}${WalletRoutesEnum.transactions}`}
        className={styles.asset}
    >
      {children}
    </Link>);

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
      return <Switch
        className={styles.assetSwitch}
        checked={token.isShow}
      />;
    }
    if (onClickCheckBox) {
      return <Checkbox
        className={styles.assetCheckBox}
        size={'medium'}
        checked={isCheckBoxChecked}
        checkedIcon={<CheckedIcon />}
        icon={<UnCheckedIcon />}
        disableRipple
      />;
    }
    return <span className={styles.amount}>
      {formattedAmount}
    </span>;
  };

  return (
    <>
      {renderWrapper(
        <div className={styles.row}>
          <div className={cn(styles.icon)}>{renderIcon()}</div>
          <div className={styles.info}>
            <span className={styles.symbol}>{renderSymbol()}</span>
            <span className={styles.name}>
              {token?.name}
            </span>
          </div>
          {renderRightCol()}
        </div>,
      )}
      <Divider className={styles.divider} />
    </>
  );
};

export const Token = memo(TokenComponent);
