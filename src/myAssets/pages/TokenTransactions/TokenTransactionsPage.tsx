import React, { useCallback, useEffect, useMemo } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'react-i18next';
// import { InView } from 'react-intersection-observer';

import { useParams } from 'react-router-dom';
import { useTokens } from 'application/utils/localStorageUtils';
import { PageTemplate, FullScreenLoader } from 'common';

// import Transaction from 'myAssets/components/Transaction';
import Transaction from 'myAssets/components/Transaction';
import { useTransactions } from 'myAssets/hooks/useLoadTransactions';
import { TokenKind } from 'myAssets/types';
import styles from './TokenTransactionsPage.module.scss';

const TokenTransactionsPageComponent: React.FC = () => {
  const { t } = useTranslation();

  const { type, address } = useParams<{
    type: TokenKind;
    address: string;
    id: string;
  }>();

  const { getTokenByAddress } = useTokens();

  const token = useMemo(
    () => getTokenByAddress(address!),
    [getTokenByAddress, address]
  );

  const { transactions } = useTransactions({ tokenAddress: address });

  useEffect(() => {
    // setLastBlockToInitialLastBlock();
    // resetTransactionsState();
  }, []);

  // const handleChangeView = (inView: boolean) => {
  //   if (inView) {
  //     if (type === TokenKind.Native) {
  //       loadTransactionsTrigger();
  //     } else {
  //       loadTransactionsTrigger({ tokenAddress: address });
  //     }
  //   }
  // };

  const renderTransactionsList = useCallback(
    () =>
      transactions &&
      Object.entries(transactions).map(([date, transactions]) => (
        <li key={date}>
          <p className={styles.date}>{date}</p>
          <ul className={styles.transactionsList}>
            {transactions.map((trx) => (
              <li key={trx.id}>
                <Transaction trx={trx} />
              </li>
            ))}
          </ul>
        </li>
      )),
    [JSON.stringify(transactions)]
  );

  const tokenSymbol = type === TokenKind.Native ? address : token?.symbol;

  if (
    // loading &&
    isEmpty(transactions)
  ) {
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
        {/* <InView onChange={handleChangeView}>
          <div />
        </InView> */}
      </div>
    </PageTemplate>
  );
};

export const TokenTransactionsPage = TokenTransactionsPageComponent;
