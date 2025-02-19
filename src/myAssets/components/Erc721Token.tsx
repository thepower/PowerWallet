import React, { FC, memo } from 'react';
import cn from 'classnames';
import { Checkbox, Divider } from 'common';
import { TErc721Token, TToken } from 'myAssets/types';
import styles from './Erc721Token.module.scss';
import NFTDefault from './icons/nft-default.svg';

type OwnProps = {
  collection: TToken;
  token: TErc721Token;
  isCheckBoxChecked?: boolean;
  onClickCheckBox?: (value: string) => void;
};

type TokenProps = OwnProps;

const Erc721TokenComponent: FC<TokenProps> = ({
  collection,
  token,
  isCheckBoxChecked,
  onClickCheckBox
}) => {
  const onClickToken = () => {
    if (onClickCheckBox) {
      onClickCheckBox(token.id);
    }
  };

  const renderIcon = () => (
    <img className={styles.icon} src={NFTDefault} alt={token?.name} />
  );

  const renderRightCol = () => {
    if (onClickCheckBox) {
      return (
        <Checkbox
          className={styles.assetCheckBox}
          size={'medium'}
          onClick={() => onClickCheckBox(token.id)}
          checked={isCheckBoxChecked}
          disableRipple
        />
      );
    }
    return <span className={styles.amount}>{token.id}</span>;
  };

  return (
    <>
      <div onClick={onClickToken} className={styles.asset}>
        <div className={styles.row}>
          <div className={cn(styles.icon)}>{renderIcon()}</div>
          <div className={styles.info}>
            <span className={styles.symbol}>
              {collection?.symbol} {token.id}
            </span>
            <span className={styles.name}>{collection?.name}</span>
          </div>
          {renderRightCol()}
        </div>
      </div>
      <Divider className={styles.divider} />
    </>
  );
};

export const Erc721Token = memo(Erc721TokenComponent);
