import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WalletApi } from '@thepowereco/tssdk';
import { formatUnits } from 'viem/utils';
import { appQueryKeys } from 'application/queryKeys';
import { Wallet } from 'application/utils/localStorageUtils';
import { LoadBalanceType, TokenKind, TToken } from 'myAssets/types';
import { useNetworkApi } from '../../application/hooks/useNetworkApi';

export const useWalletData = (wallet: Wallet | null) => {
  const { networkApi } = useNetworkApi({ chainId: wallet?.chainId });

  const getBalance = async (address: string | null | undefined) => {
    if (!address) {
      throw new Error('Address not found');
    }

    if (!networkApi) {
      throw new Error('Network API not available');
    }

    const walletApi = new WalletApi(networkApi);

    const walletData = await walletApi?.loadBalance(address);

    return walletData;
  };

  const {
    data: walletData,
    isLoading,
    isSuccess
  } = useQuery<LoadBalanceType>({
    queryKey: appQueryKeys.walletData(wallet?.address),
    queryFn: () => getBalance(wallet?.address),
    enabled: !!wallet?.address && !!networkApi
  });

  const nativeTokens = useMemo(
    () =>
      Object.entries(walletData?.amount || {}).map(
        ([symbol, amount]) =>
          ({
            type: TokenKind.Native,
            name: symbol,
            address: symbol,
            symbol,
            decimals: networkApi?.decimals.SK,
            amount,
            formattedAmount: networkApi?.decimals[symbol]
              ? formatUnits(BigInt(amount), networkApi?.decimals[symbol])
              : '0',
            isShow: true,
            chainId: wallet?.chainId
          }) as TToken
      ),
    [walletData?.amount, networkApi?.decimals, wallet?.chainId]
  );

  const getNativeTokenAmountBySymbol = useCallback(
    (symbol?: string) => {
      if (symbol && walletData?.amount?.[symbol]) {
        return {
          amount: (symbol && walletData?.amount?.[symbol])?.toString() || '0',
          formattedAmount:
            (symbol &&
              networkApi?.decimals[symbol] &&
              walletData?.amount?.[symbol] &&
              formatUnits(
                BigInt(walletData?.amount?.[symbol]),
                networkApi?.decimals[symbol]
              )) ||
            '0'
        };
      } else {
        return null;
      }
    },
    [networkApi?.decimals, walletData?.amount]
  );

  return {
    nativeTokens,
    walletData,
    getNativeTokenAmountBySymbol,
    isLoading,
    isSuccess
  };
};
