import React, { useCallback, useEffect, useMemo } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'react-i18next';

import { useParams } from 'react-router-dom';
import {
  useTokensStore,
  useWalletsStore
} from 'application/utils/localStorageUtils';
import { PageTemplate, FullScreenLoader, CopyButton, Button } from 'common';

import Transaction from 'myAssets/components/Transaction';
import { useTokenTransactionsHistory } from 'myAssets/hooks';
import { useTransactionsHistory } from 'myAssets/hooks/useTransactions';
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

  const { activeWallet } = useWalletsStore();

  const { walletData } = useWalletData(activeWallet);

  const { getTokenByAddress } = useTokensStore();

  const token = useMemo(
    () => getTokenByAddress(address!),
    [getTokenByAddress, address]
  );

  const isNative = type === TokenKind.Native;

  const {
    groupedTransactions,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPageTransactions
  } = useTransactionsHistory({
    initialBlock: walletData?.lastblock?.tx,
    tokenAddress: token?.address,
    enabled: isNative
  });

  const {
    groupedTokenTransactions,
    fetchNextPage: fetchTokenTransactionsNextPage,
    isLoading: isLoadingTokenTransactions,
    isFetchingNextPage: isFetchingTokenTransactions,
    hasNextPage: hasNextPageTokenTransactions
  } = useTokenTransactionsHistory({
    tokenAddress: address as string,
    enabled: !isNative
  });

  useEffect(() => {
    if (walletData) {
      if (isNative) {
        fetchNextPage();
      } else {
        fetchTokenTransactionsNextPage();
      }
    }
  }, [fetchNextPage, fetchTokenTransactionsNextPage, isNative, walletData]);

  const loadMore = () => {
    if (
      (!isLoadingTokenTransactions || !isLoading) &&
      (!isFetchingTokenTransactions || !isFetchingNextPage) &&
      walletData
    ) {
      if (isNative) {
        fetchNextPage();
      } else {
        fetchTokenTransactionsNextPage();
      }
    }
  };

  const renderTransactionsList = useCallback(
    () =>
      (groupedTransactions || groupedTokenTransactions) &&
      Object.entries(
        isNative ? groupedTransactions : groupedTokenTransactions
      ).map(([date, transactions]) => (
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
    [groupedTokenTransactions, groupedTransactions, isNative]
  );

  const tokenSymbol = type === TokenKind.Native ? address : token?.symbol;

  if (
    (isLoadingTokenTransactions || isLoading) &&
    isEmpty(groupedTokenTransactions)
  ) {
    return <FullScreenLoader />;
  }

  return (
    <PageTemplate
      topBarChild={`${tokenSymbol} ${t('transactions')}`}
      backUrl='/'
      backUrlText={t('home')!}
    >
      <CopyButton
        textButton={activeWallet?.address || ''}
        className={styles.addressButton}
        iconClassName={styles.copyIcon}
      />
      <div className={styles.transactions}>
        <ul className={styles.groupByDates}>{renderTransactionsList()}</ul>
      </div>
      <Button
        className={styles.loadMoreButton}
        onClick={loadMore}
        variant='contained'
        loading={isFetchingTokenTransactions || isFetchingNextPage}
        disabled={
          isNative ? !hasNextPageTransactions : !hasNextPageTokenTransactions
        }
      >
        {t('loadMore')}
      </Button>
    </PageTemplate>
  );
};

export const TokenTransactionsPage = TokenTransactionsPageComponent;
