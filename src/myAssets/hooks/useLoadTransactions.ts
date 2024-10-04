import { useInfiniteQuery } from '@tanstack/react-query';
import { WalletApi } from '@thepowereco/tssdk';
import { format } from 'date-fns';
import { groupBy } from 'lodash';
import { useNetworkApi } from 'application/hooks/useNetworkApi';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { TransactionType } from 'myAssets/types';

export function useTransactionsHistory({
  initialBlock,
  tokenAddress,
  perPage = 10
}: {
  initialBlock?: string;
  tokenAddress?: string;
  perPage?: number;
}) {
  const { activeWallet } = useWalletsStore();

  const { networkApi } = useNetworkApi({ chainId: activeWallet?.chainId });

  async function fetchTransactionsHistory({
    pageParam,
    tokenAddress,
    perPage = 10
  }: {
    pageParam: string;
    tokenAddress?: string;
    perPage: number;
  }): Promise<{
    transactions: TransactionType[];
    nextPageParam: string | null;
  }> {
    const transactionHistory = new Map<string, TransactionType>();
    let loadedBlocks = 0;
    let lastBlock = pageParam;

    if (!networkApi) {
      throw new Error('Network API is not ready');
    }

    if (!activeWallet) {
      throw new Error('Wallet not found');
    }

    const walletApi = new WalletApi(networkApi);

    while (lastBlock !== '0000000000000000' && loadedBlocks < perPage) {
      const block: any = await walletApi.getBlock(
        lastBlock,
        activeWallet.address
      );
      loadedBlocks += 1;

      const txs = Object.fromEntries(
        Object.entries<Omit<TransactionType, 'id'>>(block.txs).filter(
          ([, tx]) =>
            !tokenAddress || tx.from === tokenAddress || tx.to === tokenAddress
        )
      );

      for (const [key, tx] of Object.entries(txs)) {
        transactionHistory.set(key, {
          id: key,
          ...tx
        });
      }

      lastBlock =
        block.bals[activeWallet.address]?.lastblk || '0000000000000000';
    }

    return {
      transactions: Array.from(transactionHistory.values()),
      nextPageParam: lastBlock !== '0000000000000000' ? lastBlock : null
    };
  }

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: tokenAddress
      ? ['transactionsHistory', activeWallet?.address, tokenAddress]
      : ['transactionsHistory', activeWallet?.address],
    initialPageParam: initialBlock!,

    queryFn: ({ pageParam }) => {
      return fetchTransactionsHistory({
        pageParam,
        tokenAddress,
        perPage
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextPageParam,
    enabled: tokenAddress
      ? !!initialBlock && !!activeWallet?.address
      : !!initialBlock && !!activeWallet?.address && !!tokenAddress
  });

  const allTransactions =
    data?.pages.flatMap((page) => page.transactions) || [];

  const groupedTransactions = groupBy(allTransactions, (trx) =>
    format(new Date(trx.timestamp), 'dd MMM yyyy')
  );

  return {
    groupedTransactions,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
}
