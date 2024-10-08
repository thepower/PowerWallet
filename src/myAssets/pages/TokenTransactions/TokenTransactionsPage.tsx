import React, { useCallback, useEffect } from 'react';
import { push } from 'connected-react-router';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'react-i18next';
import { InView } from 'react-intersection-observer';
import { connect, ConnectedProps } from 'react-redux';

import { RouteComponentProps } from 'react-router';
import { RootState } from 'application/store';
import { PageTemplate, FullScreenLoader } from 'common';

import Transaction from 'myAssets/components/Transaction';
import { getTokenByID } from 'myAssets/selectors/tokensSelectors';
import { getGroupedWalletTransactions } from 'myAssets/selectors/transactionsSelectors';
import {
  loadTransactionsTrigger,
  resetTransactionsState
} from 'myAssets/slices/transactionsSlice';
import { setLastBlockToInitialLastBlock } from 'myAssets/slices/walletSlice';
import { TokenKind } from 'myAssets/types';
import { checkIfLoading } from 'network/selectors';
import styles from './TokenTransactionsPage.module.scss';

type OwnProps = RouteComponentProps<{ type: TokenKind; address: string }>;

const mapDispatchToProps = {
  routeTo: push,
  loadTransactionsTrigger,
  setLastBlockToInitialLastBlock,
  resetTransactionsState
};

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  loading: checkIfLoading(state, loadTransactionsTrigger.type),
  transactions: getGroupedWalletTransactions(state),
  type: props.match?.params?.type,
  address: props.match?.params?.address,
  token: getTokenByID(state, props.match?.params?.address)
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type TokenTransactionsPageProps = ConnectedProps<typeof connector>;

const TokenTransactionsPageComponent: React.FC<TokenTransactionsPageProps> = ({
  type,
  address,
  token,
  loading,
  transactions,
  setLastBlockToInitialLastBlock,
  resetTransactionsState,
  loadTransactionsTrigger
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    setLastBlockToInitialLastBlock();
    resetTransactionsState();
  }, []);

  const handleChangeView = (inView: boolean) => {
    if (inView) {
      if (type === TokenKind.Native) {
        loadTransactionsTrigger();
      } else {
        loadTransactionsTrigger({ tokenAddress: address });
      }
    }
  };

  const renderTransactionsList = useCallback(
    () =>
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
        <InView onChange={handleChangeView}>
          <div />
        </InView>
      </div>
    </PageTemplate>
  );
};

export const TokenTransactionsPage = connector(TokenTransactionsPageComponent);
