import React, { useState, KeyboardEvent } from 'react';
import { Collapse } from '@mui/material';
import cn from 'classnames';
import { format } from 'date-fns';
import isArray from 'lodash/isArray';

import { useTranslation } from 'react-i18next';
import { useWallets } from 'application/utils/localStorageUtils';
import { Divider } from 'common';
import { TransactionType } from 'myAssets/types';
import {
  BarCodeIcon,
  CoinIcon,
  CubeIcon,
  FingerPrintIcon,
  FromArrowIcon,
  KeyIcon,
  LogoIcon,
  MinimizeIcon,
  SuccessIcon,
  ToArrowIcon,
  WatchIcon
} from './icons';
import styles from './Transaction.module.scss';
import { FaucetSvg, SendSvg } from '../../assets/icons';

type OwnProps = { trx: TransactionType };
type TransactionProps = OwnProps;

const Transaction: React.FC<TransactionProps> = ({ trx }) => {
  const [expanded, setExpanded] = useState(false);
  const { activeWallet } = useWallets();
  const { t } = useTranslation();
  const handleClick = () => {
    setExpanded((prev) => !prev);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      setExpanded((prev) => !prev);
    }
  };

  const renderGrid = () => {
    const rows = [
      { Icon: <SuccessIcon />, key: t('tx'), value: trx.id },
      { Icon: <FromArrowIcon />, key: t('from'), value: trx.from },
      { Icon: <ToArrowIcon />, key: t('to'), value: trx.to },
      { Icon: <CoinIcon />, key: t('amount'), value: trx.amount },
      { Icon: <LogoIcon />, key: t('cur'), value: trx.cur },
      {
        Icon: <WatchIcon />,
        key: t('timestamp'),
        value: format(trx.timestamp, 'MMMM dd, yyyy, \'at\' p')
      },
      { Icon: <BarCodeIcon />, key: t('seq'), value: trx.seq },
      {
        Icon: <KeyIcon />,
        key: t('publicKey'),
        value: trx?.sigverify?.pubkeys?.[0]
      },
      {
        Icon: <FingerPrintIcon />,
        key: t('signature'),
        value: trx.sig[trx.sigverify?.pubkeys?.[0]]
      },
      { Icon: <CubeIcon />, key: t('inBlock'), value: trx.inBlock }
    ];

    return (
      <div className={styles.grid}>
        {rows.map(({ Icon, key, value }) => (
          <React.Fragment key={key}>
            {Icon}
            <span className={styles.key}>{`${key}:`}</span>
            <span className={styles.value}>{value}</span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const isReceived = activeWallet?.address === trx.to;

  return (
    <>
      <div className={styles.transaction} aria-expanded={expanded}>
        <div
          className={styles.shortInfoButton}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role='button'
        >
          <div className={styles.row}>
            <div className={cn(styles.icon)}>
              {isReceived ? (
                <FaucetSvg className={styles.receiveIcon} />
              ) : (
                <SendSvg className={styles.sendIcon} />
              )}
            </div>
            <div className={styles.info}>
              <span className={styles.name}>{t('myWallet')}</span>
              <span className={cn(styles.date, styles.fullDate)}>
                {format(trx.timestamp, 'dd MMM yyyy \'at\' p')}
              </span>
              <span className={cn(styles.date, styles.compactDate)}>
                {format(trx.timestamp, '\'at\' p')}
              </span>
            </div>
            {trx.amount && (
              <span className={styles.amount}>
                {`${isReceived ? '+' : '-'} ${
                  trx.amount.toFixed?.(2) || trx.amount
                } ${trx.cur}`}
              </span>
            )}
          </div>
          {!isArray(trx.txext) && (
            <div className={styles.comment}>
              <div className={styles.commentTitle}>{t('comment')}</div>
              <div className={styles.msg}>{trx.txext.msg}</div>
            </div>
          )}
        </div>
        <Collapse in={expanded}>
          <div className={styles.content}>
            <div
              role='button'
              tabIndex={0}
              className={styles.row}
              onClick={handleClick}
              onKeyDown={handleKeyDown}
            >
              <span className={styles.title}>
                {`${t('transaction')} #${trx.timestamp}`}
              </span>
              <MinimizeIcon
                className={cn(
                  styles.minimizedIcon,
                  expanded && styles.expandMinimizedIcon
                )}
              />
            </div>
            {renderGrid()}
            {/* <CopyButton textButton={t('copy')} copyInfo={trx.id} /> */}
          </div>
        </Collapse>
      </div>
      <Divider className={styles.divider} />
    </>
  );
};

export default Transaction;
