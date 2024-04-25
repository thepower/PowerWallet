import React, { FC, memo } from 'react';
import { TokenType } from 'myAssets/slices/tokensSlice';
import cn from 'classnames';
import { Checkbox, Divider, Switch } from 'common';
import { BigNumber, formatFixed } from '@ethersproject/bignumber';

import { Link } from 'react-router-dom';
import { WalletRoutesEnum } from 'application/typings/routes';
import { CheckedIcon, LogoIcon, UnCheckedIcon } from 'assets/icons';
import styles from './Asset.module.scss';

type OwnProps = {
  asset: TokenType,
  isCheckBoxChecked?: boolean,
  onClickSwitch?: (checked: boolean) => void,
  onClickCheckBox?: (value: string) => void
};

type AssetProps = OwnProps;

const AssetComponent: FC<AssetProps> = ({
  asset, isCheckBoxChecked, onClickSwitch, onClickCheckBox,
}) => {
  const { amount, decimals, type } = asset;
  const formattedAmount = type === 'erc20'
    ? formatFixed(BigNumber.from(amount), decimals)
    : amount;

  const onClickAsset = () => {
    if (onClickSwitch) {
      onClickSwitch(!asset.isShow);
    }
    if (onClickCheckBox) {
      onClickCheckBox(asset.address);
    }
  };

  const renderWrapper = (children: React.ReactNode) => (onClickSwitch || onClickCheckBox ?
    <div onClick={onClickAsset} className={styles.asset}>{children}</div>
    : <Link
        to={`/${asset.type}/${asset.address}${WalletRoutesEnum.transactions}`}
        className={styles.asset}
    >
      {children}
    </Link>);

  const renderSymbol = () => {
    const { symbol } = asset;
    return onClickCheckBox ? `${symbol} ${formattedAmount}` : symbol;
  };

  const renderIcon = () => {
    switch (asset.address) {
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
        checked={asset.isShow}
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
              {asset?.name}
            </span>
          </div>
          {renderRightCol()}
        </div>,
      )}
      <Divider className={styles.divider} />
    </>
  );
};

export const Asset = memo(AssetComponent);
