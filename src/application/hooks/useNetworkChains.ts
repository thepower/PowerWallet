import { useQuery } from '@tanstack/react-query';
import { NetworkApi } from '@thepowereco/tssdk';
import { appQueryKeys } from 'application/queryKeys';

const getNetworkChains = async () => {
  try {
    const config = await NetworkApi.getChainGlobalConfig();

    return config.settings;
  } catch (error) {
    console.log(error);
    return;
  }
};

export const useNetworkChains = () => {
  const {
    data: networkChains,
    isLoading,
    isSuccess
  } = useQuery({
    queryKey: appQueryKeys.networkChains(),
    queryFn: getNetworkChains
  });

  return {
    networkChains,
    isLoading,
    isSuccess
  };
};
