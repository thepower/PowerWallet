/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AddressApi } from '@thepowereco/tssdk';
import { format } from 'date-fns';
import { groupBy } from 'lodash';
import {
  Abi,
  AbiEvent,
  AbiEventSignatureNotFoundError,
  BlockNumber,
  BlockTag,
  Chain,
  Client,
  ContractEventName,
  decodeEventLog,
  DecodeLogDataMismatch,
  DecodeLogTopicsMismatch,
  encodeEventTopics,
  EncodeEventTopicsParameters,
  formatLog,
  formatUnits,
  GetLogsParameters,
  GetLogsReturnType,
  LogTopic,
  numberToHex,
  parseAbiItem,
  ParseEventLogsParameters,
  ParseEventLogsReturnType,
  RpcLog,
  toEventSelector,
  Transport
} from 'viem';

import { useNetworkApi } from 'application/hooks/useNetworkApi';
import { appQueryKeys } from 'application/queryKeys';
import {
  useTokensStore,
  useWalletsStore
} from 'application/utils/localStorageUtils';
import { TokenKind, TransactionFormattedType } from 'myAssets/types';

// function includesArgs(parameters: {
//   args: unknown;
//   inputs: AbiEvent['inputs'];
//   matchArgs: unknown;
// }) {
//   const { args, inputs, matchArgs } = parameters;

//   if (!matchArgs) return true;
//   if (!args) return false;

//   function isEqual(input: AbiEventParameter, value: unknown, arg: unknown) {
//     try {
//       if (input.type === 'address')
//         return isAddressEqual(value as Address, arg as Address);
//       if (input.type === 'string' || input.type === 'bytes')
//         return keccak256(toBytes(value as string)) === arg;
//       return value === arg;
//     } catch {
//       return false;
//     }
//   }

//   if (Array.isArray(args) && Array.isArray(matchArgs)) {
//     return matchArgs.every((value, index) => {
//       if (value === null || value === undefined) return true;
//       const input = inputs[index];
//       if (!input) return false;
//       const value_ = Array.isArray(value) ? value : [value];
//       return value_.some((value) => isEqual(input, value, args[index]));
//     });
//   }

//   if (
//     typeof args === 'object' &&
//     !Array.isArray(args) &&
//     typeof matchArgs === 'object' &&
//     !Array.isArray(matchArgs)
//   )
//     return Object.entries(matchArgs).every(([key, value]) => {
//       if (value === null || value === undefined) return true;
//       const input = inputs.find((input) => input.name === key);
//       if (!input) return false;
//       const value_ = Array.isArray(value) ? value : [value];
//       return value_.some((value) =>
//         isEqual(input, value, (args as Record<string, unknown>)[key])
//       );
//     });

//   return false;
// }

export function parseEventLogs<
  abi extends Abi | readonly unknown[],
  strict extends boolean | undefined = true,
  eventName extends
    | ContractEventName<abi>
    | ContractEventName<abi>[]
    | undefined = undefined
>(
  parameters: ParseEventLogsParameters<abi, eventName, strict>
): ParseEventLogsReturnType<abi, eventName, strict> {
  const { abi, logs, strict = true } = parameters;

  const eventName = (() => {
    if (!parameters.eventName) return undefined;
    if (Array.isArray(parameters.eventName)) return parameters.eventName;
    return [parameters.eventName as string];
  })();

  return logs
    .map((log) => {
      try {
        const abiItem = (abi as Abi).find(
          (abiItem) =>
            abiItem.type === 'event' &&
            log.topics[0] === toEventSelector(abiItem)
        ) as AbiEvent;
        if (!abiItem) return null;

        const event = decodeEventLog({
          ...log,
          abi: [abiItem],
          strict
        });

        // Check that the decoded event name matches the provided event name.
        if (eventName && !eventName.includes(event.eventName)) return null;

        // Check that the decoded event args match the provided args.
        // if (
        //   !includesArgs({
        //     args: event.args,
        //     inputs: abiItem.inputs,
        //     matchArgs: args
        //   })
        // )
        //   return null;

        return { ...event, ...log };
      } catch (err) {
        let eventName: string | undefined;
        let isUnnamed: boolean | undefined;

        if (err instanceof AbiEventSignatureNotFoundError) return null;
        if (
          err instanceof DecodeLogDataMismatch ||
          err instanceof DecodeLogTopicsMismatch
        ) {
          // If strict mode is on, and log data/topics do not match event definition, skip.
          if (strict) return null;
          eventName = err.abiItem.name;
          isUnnamed = err.abiItem.inputs?.some((x) => !('name' in x && x.name));
        }

        // Set args to empty if there is an error decoding (e.g. indexed/non-indexed params mismatch).
        return { ...log, args: isUnnamed ? [] : {}, eventName };
      }
    })
    .filter(Boolean) as unknown as ParseEventLogsReturnType<
    abi,
    eventName,
    strict
  >;
}

export async function getLogs<
  chain extends Chain | undefined,
  const abiEvent extends AbiEvent | undefined = undefined,
  const abiEvents extends
    | readonly AbiEvent[]
    | readonly unknown[]
    | undefined = abiEvent extends AbiEvent ? [abiEvent] : undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends BlockNumber | BlockTag | undefined = undefined,
  toBlock extends BlockNumber | BlockTag | undefined = undefined
>(
  client: Client<Transport, chain>,
  {
    address,
    blockHash,
    fromBlock,
    toBlock,
    event,
    events: events_,
    args,
    strict: strict_
  }: GetLogsParameters<abiEvent, abiEvents, strict, fromBlock, toBlock> = {}
): Promise<GetLogsReturnType<abiEvent, abiEvents, strict, fromBlock, toBlock>> {
  const strict = strict_ ?? false;
  const events = events_ ?? (event ? [event] : undefined);

  let topics: LogTopic[] = [];
  if (events) {
    const encoded = (events as AbiEvent[]).flatMap((event) =>
      encodeEventTopics({
        abi: [event],
        eventName: (event as AbiEvent).name,
        args: events_ ? undefined : args
      } as EncodeEventTopicsParameters)
    );
    // TODO: Clean up type casting
    topics = [encoded as LogTopic];
    if (event) topics = topics[0] as LogTopic[];
  }

  let logs: RpcLog[];
  if (blockHash) {
    logs = await client.request({
      method: 'eth_getLogs',
      params: [{ address, topics, blockHash }]
    });
  } else {
    logs = await client.request({
      method: 'eth_getLogs',
      params: [
        {
          address,
          topics,
          fromBlock:
            typeof fromBlock === 'bigint' ? numberToHex(fromBlock) : fromBlock,
          toBlock: typeof toBlock === 'bigint' ? numberToHex(toBlock) : toBlock
        }
      ]
    });
  }

  const formattedLogs = logs.map((log) => formatLog(log));
  if (!events)
    return formattedLogs as GetLogsReturnType<
      abiEvent,
      abiEvents,
      strict,
      fromBlock,
      toBlock
    >;
  return parseEventLogs({
    abi: events,
    args: args as any,
    logs: formattedLogs,
    strict
  }) as unknown as GetLogsReturnType<
    abiEvent,
    abiEvents,
    strict,
    fromBlock,
    toBlock
  >;
}

export function useTokenTransactionsHistory({
  initialBlock,
  tokenAddress,
  perPage = 10000,
  enabled
}: {
  initialBlock?: bigint;
  tokenAddress: string;
  perPage?: number;
  enabled?: boolean;
}) {
  const { activeWallet } = useWalletsStore();
  const { getTokenByAddress } = useTokensStore();

  const { networkApi } = useNetworkApi({ chainId: activeWallet?.chainId });

  async function fetchTransactionsHistory({
    pageParam,
    tokenAddress,
    perPage = 10000
  }: {
    pageParam: bigint;
    tokenAddress: string;
    perPage: number;
  }): Promise<{
    transactions: TransactionFormattedType[];
    nextPageParam: bigint | null;
  }> {
    if (!networkApi) {
      throw new Error('Network API is not ready');
    }

    if (!activeWallet) {
      throw new Error('Wallet not found');
    }

    const publicClient = networkApi.createPublicClient({
      queryParams: new URLSearchParams({ pwrmatch: '1' })
    });

    if (!pageParam) {
      pageParam = await publicClient.getBlockNumber();
    }

    const transactions: TransactionFormattedType[] = [];
    const toBlock = pageParam;
    const fromBlock =
      toBlock > BigInt(perPage) ? toBlock - BigInt(perPage) : 0n;

    const token = getTokenByAddress(tokenAddress);
    const isErc721 = token?.type === TokenKind.Erc721;
    const event = isErc721
      ? 'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
      : 'event Transfer(address indexed from, address indexed to, uint256 value)';

    const logs = await getLogs(publicClient as Client, {
      address: tokenAddress as `0x${string}`,
      fromBlock,
      toBlock,
      event: parseAbiItem(event),
      args: {
        from: AddressApi.textAddressToEvmAddress(activeWallet.address)
      }
    });

    if (logs && logs.length > 0) {
      for (const log of logs) {
        // @ts-ignore
        const value = log.args?.value ? log.args.value.toString() : '0';

        transactions.push({
          from: log.args?.from || '',
          to: log.args?.to || '',
          blockHeight: Number(log.blockNumber),
          // @ts-ignore
          id: log?.transactionId,
          txHash: log.transactionHash,
          // @ts-ignore
          t: Number(log.blockTimestamp) * 1000,
          ver: 2,
          amount: isErc721 ? '1' : formatUnits(BigInt(value), token!.decimals),
          blockHash: log.blockHash,
          body: '',
          call: {
            args: [],
            function: ''
          },
          currency: token?.symbol || '',
          extdata: {
            origin: ''
          },
          kind: '-',
          payload: [],
          seq: 0,
          sig: {},
          // @ts-ignore
          tokenId: isErc721 ? log.args?.tokenId?.toString() : '',
          sigverify: {
            invalid: 0,
            pubkeys: [],
            valid: 0
          },
          txext: {}
        });
      }
    }

    return {
      transactions,
      nextPageParam: fromBlock > 0n ? fromBlock : null
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
    queryKey: appQueryKeys.tokenTransactionsHistory(
      activeWallet?.address,
      tokenAddress
    ),

    initialPageParam: initialBlock!,

    queryFn: ({ pageParam }) => {
      return fetchTransactionsHistory({
        pageParam,
        tokenAddress,
        perPage
      });
    },

    getNextPageParam: (lastPage) => lastPage.nextPageParam,
    enabled:
      !!initialBlock && !!activeWallet?.address && !!tokenAddress && enabled
  });

  const allTransactions = useMemo(
    () => data?.pages.flatMap((page) => page.transactions) || [],
    [data]
  );

  const groupedTokenTransactions = useMemo(
    () =>
      groupBy(allTransactions, (trx) => format(new Date(trx.t), 'dd MMM yyyy')),
    [allTransactions]
  );

  return {
    groupedTokenTransactions,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
}
