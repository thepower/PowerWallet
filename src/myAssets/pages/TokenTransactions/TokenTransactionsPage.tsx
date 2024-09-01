import React, { useCallback, useEffect, useMemo } from 'react';
import { push } from 'connected-react-router';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'react-i18next';
// import { InView } from 'react-intersection-observer';
import { connect, ConnectedProps } from 'react-redux';

import { useParams } from 'react-router-dom';
import { RootState } from 'application/reduxStore';
import { PageTemplate, FullScreenLoader } from 'common';

// import Transaction from 'myAssets/components/Transaction';
// import { useTransactions } from 'myAssets/hooks/useLoadTransactions';
import { getTokenByID } from 'myAssets/selectors/tokensSelectors';
import {
  loadTransactionsTrigger,
  resetTransactionsState
} from 'myAssets/slices/transactionsSlice';
import { setLastBlockToInitialLastBlock } from 'myAssets/slices/walletSlice';
import { TokenKind } from 'myAssets/types';
import { checkIfLoading } from 'network/selectors';
import styles from './TokenTransactionsPage.module.scss';

const mapDispatchToProps = {
  routeTo: push,
  loadTransactionsTrigger,
  setLastBlockToInitialLastBlock,
  resetTransactionsState
};

const mapStateToProps = (state: RootState) => ({
  loading: checkIfLoading(state, loadTransactionsTrigger.type),
  // transactions: getGroupedWalletTransactions(state),
  transactions: [],

  getTokenByID: (address: string) => getTokenByID(state, address)
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type TokenTransactionsPageProps = ConnectedProps<typeof connector>;

const TokenTransactionsPageComponent: React.FC<TokenTransactionsPageProps> = ({
  loading,
  transactions = [],
  setLastBlockToInitialLastBlock,
  resetTransactionsState,
  getTokenByID
}) => {
  const { t } = useTranslation();

  const { type, address } = useParams<{
    type: TokenKind;
    address: string;
    id: string;
  }>();

  const token = useMemo(() => getTokenByID(address!), [getTokenByID, address]);

  // useTransactions({ tokenAddress });

  useEffect(() => {
    setLastBlockToInitialLastBlock();
    resetTransactionsState();
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
      Object.entries(transactions).map(([date, transactions]) => (
        <li key={date}>
          <p className={styles.date}>{date}</p>
          <ul className={styles.transactionsList}>
            {/* {transactions.map((trx) => (
              <li key={trx.id}>
                <Transaction trx={trx} />
              </li>
            ))} */}
          </ul>
        </li>
      )),
    [JSON.stringify(transactions)]
  );

  const tokenSymbol = type === TokenKind.Native ? address : token?.symbol;

  if (loading && isEmpty(transactions)) {
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

export const TokenTransactionsPage = connector(TokenTransactionsPageComponent);
