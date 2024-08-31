import { useQuery } from '@tanstack/react-query';
import { NetworkApi } from '@thepowereco/tssdk';

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
    queryKey: ['networkChains'],
    queryFn: getNetworkChains
  });

  return {
    networkChains,
    isLoading,
    isSuccess
  };
};
