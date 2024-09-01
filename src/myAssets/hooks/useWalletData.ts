import { useQuery } from '@tanstack/react-query';
import { WalletApi } from '@thepowereco/tssdk';
import { useWallets } from 'application/utils/localStorageUtils';
import { LoadBalanceType } from 'myAssets/types';
import { useNetworkApi } from '../../application/hooks/useNetworkApi';

export const useWalletData = () => {
  const { activeWallet } = useWallets();
  const { networkApi } = useNetworkApi({ chainId: activeWallet?.chainId });

  const getBalance = async (address: string | null | undefined) => {
    try {
      if (!address) {
        throw new Error('Address not found');
      }

      if (!networkApi) {
        throw new Error('Network API not available');
      }

      const walletApi = new WalletApi(networkApi);

      const walletData = await walletApi?.loadBalance(address);

      return walletData;
    } catch (error) {
      console.log(error);
    }
  };

  const {
    data: walletData,
    isLoading,
    isSuccess
  } = useQuery<LoadBalanceType>({
    queryKey: ['walletData', activeWallet?.address],
    queryFn: () => getBalance(activeWallet?.address),
    enabled: !!activeWallet?.address && !!networkApi
  });

  return {
    walletData,
    isLoading,
    isSuccess
  };
};
