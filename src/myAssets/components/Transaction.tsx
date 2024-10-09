import React, { useState, KeyboardEvent, useCallback } from 'react';
import { Collapse } from '@mui/material';
import { AddressApi } from '@thepowereco/tssdk';
import cn from 'classnames';
import { format } from 'date-fns';
import isArray from 'lodash/isArray';

import { useTranslation } from 'react-i18next';
import { useWalletsStore } from 'application/utils/localStorageUtils';
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
import { FaucetSvg, SendSvg, SponsorSvg } from '../../assets/icons';

type OwnProps = { trx: TransactionType };
type TransactionProps = OwnProps;

const Transaction: React.FC<TransactionProps> = ({ trx }) => {
  const [expanded, setExpanded] = useState(false);
  const { activeWallet } = useWalletsStore();
  const { t } = useTranslation();
  const handleClick = () => {
    setExpanded((prev) => !prev);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      setExpanded((prev) => !prev);
    }
  };
  console.log(trx);
  const renderGrid = useCallback(() => {
    const sponsor =
      !isArray(trx.txext) &&
      trx?.txext?.sponsor?.length &&
      trx?.txext?.sponsor
        .map((sponsor) => sponsor && AddressApi.hexToTextAddress(sponsor))
        .join(',');

    const rows = [
      { Icon: <SuccessIcon />, key: t('tx'), value: trx.id },
      { Icon: <FromArrowIcon />, key: t('from'), value: trx.from },
      { Icon: <ToArrowIcon />, key: t('to'), value: trx.to },
      { Icon: <CoinIcon />, key: t('amount'), value: trx.amount },
      ...(sponsor
        ? [{ Icon: <CoinIcon />, key: t('sponsor'), value: sponsor }]
        : []),
      { Icon: <LogoIcon />, key: t('cur'), value: trx.cur },
      {
        Icon: <WatchIcon />,
        key: t('timestamp'),
        value: format(trx.timestamp, "MMMM dd, yyyy, 'at' p")
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
  }, [trx, t]);

  const renderComment = useCallback(() => {
    if (!isArray(trx.txext) && trx?.txext?.msg) {
      return (
        <div className={styles.comment}>
          <div className={styles.commentTitle}>{t('comment')}</div>
          <div className={styles.msg}>{trx.txext.msg}</div>
        </div>
      );
    }
    return null;
  }, [trx.txext, t]);

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
              <span className={styles.name}>{activeWallet?.name || '-'}</span>
              <span className={cn(styles.date, styles.fullDate)}>
                {format(trx.timestamp, "dd MMM yyyy 'at' p")}
              </span>
              <span className={cn(styles.date, styles.compactDate)}>
                {format(trx.timestamp, "'at' p")}
              </span>
            </div>
            {typeof trx.amount === 'number' && (
              <span className={styles.amount}>
                {`${isReceived ? '+' : '-'} ${
                  trx.amount.toFixed?.(2) || trx.amount
                } ${trx.cur}`}
              </span>
            )}
          </div>
          {renderComment()}
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
          </div>
        </Collapse>
      </div>
    </>
  );
};

export default Transaction;
