import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AddressApi } from '@thepowereco/tssdk';
import { format } from 'date-fns';
import { groupBy } from 'lodash';
import { formatUnits } from 'viem';
import { useNetworkApi } from 'application/hooks/useNetworkApi';
import { appQueryKeys } from 'application/queryKeys';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import {
  BlockType,
  TransactionFormattedType,
  TransactionType
} from 'myAssets/types';

export function useTransactionsHistory({
  initialBlock,
  perPage = 10,
  enabled
}: {
  initialBlock?: number;
  perPage?: number;
  tokenAddress?: string;
  enabled?: boolean;
}) {
  const { activeWallet } = useWalletsStore();

  const { networkApi } = useNetworkApi({ chainId: activeWallet?.chainId });

  async function fetchTransactionsHistory({
    pageParam,
    perPage = 10
  }: {
    pageParam: number;
    perPage: number;
  }): Promise<{
    transactions: TransactionFormattedType[];
    nextPageParam: number | null;
  }> {
    const transactionHistory = new Map<string, TransactionFormattedType>();
    let loadedBlocks = 0;
    let lastBlock = pageParam;

    if (!networkApi) {
      throw new Error('Network API is not ready');
    }

    if (!activeWallet) {
      throw new Error('Wallet not found');
    }

    while (lastBlock !== 0 && loadedBlocks < perPage) {
      const block: BlockType<TransactionType> =
        await networkApi.getBlockByHeight(
          `${lastBlock}?addr=${activeWallet.address}`
        );

      loadedBlocks += 1;

      const txsWithId = Object.keys(block.txs).reduce((acc, key) => {
        const tx = block.txs[key];

        const extraFields: Record<string, any> = {
          id: key,
          blockNumber: block.header.height,
          blockHash: block.hash,
          sig: Array.isArray(tx.sig)
            ? tx.sig.reduce(
                (acc: any, item: any) =>
                  Object.assign(acc, { [item.extra.pubkey]: item.signature }),
                {}
              )
            : []
        };

        if (tx.payload) {
          const payment =
            tx.payload.find((elem: any) => elem.purpose === 'transfer') ||
            tx.payload.find(
              (elem: any) =>
                elem.purpose === 'srcfee' ||
                tx.payload.find((elem: any) => elem.purpose === 'srcfeehint')
            );

          if (payment) {
            extraFields.currency = payment?.cur || '---';
            extraFields.amount =
              payment?.cur && payment?.amount
                ? formatUnits(
                    BigInt(payment.amount),
                    networkApi.decimals[payment.cur]
                  )
                : 0;
          }
        }

        Object.assign(acc, {
          [key]: {
            ...tx,
            ...extraFields
          }
        });

        return acc;
      }, {});

      const txs = Object.fromEntries(
        Object.entries<TransactionFormattedType>(txsWithId).filter(([, tx]) => {
          const address = `0x${AddressApi.textAddressToHex(
            activeWallet.address
          )}`.toLowerCase();
          return (
            tx.from?.toLowerCase() === address ||
            tx.to?.toLowerCase() === address
          );
        })
      );

      for (const [key, tx] of Object.entries(txs)) {
        transactionHistory.set(key, tx);
      }

      const foundLastBlock = block.ledger_patch.find((patch) => {
        return (
          patch[1] === 'lastblk' &&
          patch[0] ===
            `0x${AddressApi.textAddressToHex(
              activeWallet.address
            )}`.toLocaleLowerCase()
        );
      })?.[3];

      lastBlock =
        foundLastBlock && typeof foundLastBlock === 'number'
          ? foundLastBlock
          : 0;
    }

    return {
      transactions: Array.from(transactionHistory.values()),
      nextPageParam: lastBlock !== 0 ? lastBlock : null
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
    queryKey: appQueryKeys.transactionsHistory(activeWallet?.address),

    initialPageParam: initialBlock!,

    queryFn: ({ pageParam }) => {
      return fetchTransactionsHistory({
        pageParam,
        perPage
      });
    },

    getNextPageParam: (lastPage) => lastPage.nextPageParam,
    enabled: !!initialBlock && !!activeWallet?.address && enabled
  });

  const allTransactions = useMemo(
    () => data?.pages.flatMap((page) => page.transactions) || [],
    [data]
  );

  const groupedTransactions = useMemo(
    () =>
      groupBy(allTransactions, (trx) => format(new Date(trx.t), 'dd MMM yyyy')),
    [allTransactions]
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
