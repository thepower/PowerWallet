import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WalletApi } from '@thepowereco/tssdk';
import { format } from 'date-fns';
import groupBy from 'lodash/groupBy';
import { useWallets } from 'application/utils/localStorageUtils';
import { TransactionPayloadType } from 'myAssets/types';
import { useWalletData } from './useWalletData';
import { useNetworkApi } from '../../application/hooks/useNetworkApi';

export type WalletData = {
  address: string;
  encryptedWif: string;
};

export const useTransactions = ({
  tokenAddress
}: {
  tokenAddress?: string;
  isResetState?: boolean;
}) => {
  const [lastBlock, setLastBlock] = useState<string | null>(null);
  const { activeWallet } = useWallets();
  const { walletData } = useWalletData(activeWallet);
  const { networkApi } = useNetworkApi({ chainId: activeWallet?.chainId });
  const loadTransactions = async (address: string | null | undefined) => {
    if (!address) {
      throw new Error('Address not found');
    }

    if (!networkApi) {
      throw new Error('Network API not available');
    }

    const walletApi = new WalletApi(networkApi);

    const walletAddress = activeWallet?.address;
    const walletLastBlock = lastBlock || walletData?.lastblk;

    if (walletLastBlock && walletAddress) {
      const transactions: Map<string, TransactionPayloadType | string> =
        await walletApi.getRawTransactionsHistory(
          walletLastBlock,
          walletAddress,
          undefined,
          (_txID, tx: TransactionPayloadType) =>
            !tokenAddress || tx.from === tokenAddress || tx.to === tokenAddress
        );

      const lastblk = (transactions.get('needMore') as string) || null;
      transactions.delete('needMore');

      setLastBlock(lastblk);
      return Array.from(
        transactions as Map<string, TransactionPayloadType>
      ).map(([key, value]) => ({
        id: key,
        ...value
      }));
    }
  };

  const {
    data: transactions,
    isLoading,
    isSuccess
  } = useQuery({
    queryKey: ['transactions', activeWallet?.address, tokenAddress],
    queryFn: () => loadTransactions(activeWallet?.address),
    select: (transactions) => {
      return groupBy(transactions, (trx) =>
        format(trx.timestamp, 'dd MMM yyyy')
      );
    },
    enabled: !!activeWallet?.address && !!networkApi
  });

  return {
    transactions,
    isLoading,
    isSuccess
  };
};
