import React, { useCallback, useEffect, useMemo } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'react-i18next';

import { InView } from 'react-intersection-observer';
import { useParams } from 'react-router-dom';
import { useTokens, useWallets } from 'application/utils/localStorageUtils';
import { PageTemplate, FullScreenLoader } from 'common';

import Transaction from 'myAssets/components/Transaction';
import { useTransactionsHistory } from 'myAssets/hooks/useLoadTransactions';
import { useWalletData } from 'myAssets/hooks/useWalletData';
import { TokenKind } from 'myAssets/types';
import styles from './TokenTransactionsPage.module.scss';

const TokenTransactionsPageComponent: React.FC = () => {
  const { t } = useTranslation();

  const { type, address } = useParams<{
    type: TokenKind;
    address: string;
    id: string;
  }>();

  const { activeWallet } = useWallets();
  const { walletData } = useWalletData(activeWallet);

  const { getTokenByAddress } = useTokens();

  const token = useMemo(
    () => getTokenByAddress(address!),
    [getTokenByAddress, address]
  );

  const { groupedTransactions, fetchNextPage, isLoading, isFetchingNextPage } =
    useTransactionsHistory({
      initialBlock: walletData?.lastblk,
      tokenAddress: token?.address
    });

  useEffect(() => {
    if (walletData) {
      fetchNextPage();
    }
  }, [walletData]);

  const handleChangeView = (inView: boolean) => {
    if (inView && !isLoading && !isFetchingNextPage && walletData) {
      fetchNextPage();
    }
  };
  const renderTransactionsList = useCallback(
    () =>
      groupedTransactions &&
      Object.entries(groupedTransactions).map(([date, transactions]) => (
        <li key={date}>
          <p className={styles.date}>{date}</p>
          <ul className={styles.transactionsList}>
            {transactions.map((trx) => (
              <li key={trx.t}>
                <Transaction trx={trx} />
              </li>
            ))}
          </ul>
        </li>
      )),
    [groupedTransactions]
  );

  const tokenSymbol = type === TokenKind.Native ? address : token?.symbol;

  if (isLoading && isEmpty(groupedTransactions)) {
    return <FullScreenLoader />;
  }

  return (
    <PageTemplate
      topBarChild={`${tokenSymbol} ${t('transactions')}`}
      backUrl='/'
      backUrlText={t('home')!}
    >
      <div className={styles.TokenTransactionsPage}>
        <div className={styles.transactions}>
          <ul className={styles.groupByDates}>{renderTransactionsList()}</ul>
        </div>
        <InView onChange={handleChangeView}>
          <div />
        </InView>
      </div>
    </PageTemplate>
  );
};

export const TokenTransactionsPage = TokenTransactionsPageComponent;
