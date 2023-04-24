import React from 'react';
import { push } from 'connected-react-router';
import { connect, ConnectedProps } from 'react-redux';

import { DeepPageTemplate } from 'common';

import { RootState } from 'application/store';

import Transaction from 'myAssets/components/Transaction';
import { TransactionType, loadTransactionsTrigger, resetTransactionsState } from 'myAssets/slices/transactionsSlice';
import { getGroupedWalletTransactions } from 'myAssets/selectors/transactionsSelectors';
import { checkIfLoading } from 'network/selectors';
import { InView } from 'react-intersection-observer';
import { RouteComponentProps } from 'react-router';
import { TokenKind } from 'myAssets/types';
import { getTokensByID } from 'myAssets/selectors/tokensSelectors';
import { setLastBlockToInitialLastBlock } from 'myAssets/slices/walletSlice';
import styles from './TokenTransactionsPage.module.scss';

type OwnProps = RouteComponentProps<{ type: TokenKind, address: string }>;

const mapDispatchToProps = {
  routeTo: push,
  loadTransactionsTrigger,
  setLastBlockToInitialLastBlock,
  resetTransactionsState,
};

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  loading: checkIfLoading(state, loadTransactionsTrigger.type),
  transactions: getGroupedWalletTransactions(state),
  type: props.match?.params?.type,
  address: props.match?.params?.address,
  token: getTokensByID(state, props.match?.params?.address),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type TokenTransactionsPageProps = ConnectedProps<typeof connector>;

class TokenTransactionsPageComponent extends React.PureComponent<TokenTransactionsPageProps> {
  componentDidMount() {
    this.props.setLastBlockToInitialLastBlock();
    this.props.resetTransactionsState();
  }

  handleChangeView = (inView: boolean) => {
    const { type, address } = this.props;
    if (inView) {
      if (type === 'native') {
        this.props.loadTransactionsTrigger();
      } else {
        this.props.loadTransactionsTrigger({ tokenAddress: address });
      }
    }
  };

  renderTransactionsList = ([date, transactions]: [date: string, transactions: TransactionType[]]) => (
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
  );

  render() {
    const {
      transactions, token, address, type,
    } = this.props;

    const tokenSymbol = type === 'native' ? address : token?.symbol;

    return <DeepPageTemplate topBarTitle={`${tokenSymbol} transactions`} backUrl="/my-assets">
      <div className={styles.tokenTransactionsPage}>
        <div className={styles.transactions}>
          <ul className={styles.groupByDates}>{Object.entries(transactions).map(this.renderTransactionsList)}</ul>
        </div>
        <InView onChange={this.handleChangeView}>
          <div />
        </InView>
      </div>
    </DeepPageTemplate>;
  }
}

export const TokenTransactionsPage = connector(TokenTransactionsPageComponent);
