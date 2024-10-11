import { useQuery } from '@tanstack/react-query';
import { WalletApi } from '@thepowereco/tssdk';
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
    queryKey: ['walletData', wallet?.address],
    queryFn: () => getBalance(wallet?.address),
    enabled: !!wallet?.address && !!networkApi
  });

  const nativeTokens = Object.entries(walletData?.amount || {}).map(
    ([symbol, amount]) =>
      ({
        type: TokenKind.Native,
        name: symbol,
        address: symbol,
        symbol,
        decimals: 9,
        amount,
        isShow: true,
        chainId: wallet?.chainId
      }) as TToken
  );

  const getNativeTokenAmountBySymbol = (symbol?: string) => {
    return (symbol && walletData?.amount?.[symbol]) || 0;
  };

  return {
    nativeTokens,
    walletData,
    getNativeTokenAmountBySymbol,
    isLoading,
    isSuccess
  };
};
