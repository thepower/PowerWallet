import { experimental_createPersister } from '@tanstack/query-persist-client-core';
import { useQuery } from '@tanstack/react-query';
import { NetworkApi } from '@thepowereco/tssdk';
import { appQueryKeys } from 'application/queryKeys';
import { localStorageRootPath } from 'application/utils/localStorageUtils';

export const persister = experimental_createPersister({
  storage: window.localStorage,
  prefix: localStorageRootPath
});

const bootstrap = async (chainId?: number) => {
  try {
    if (!chainId) {
      console.log('Chain ID not found');
      return;
    }
    const networkApi = new NetworkApi(chainId);
    await networkApi.bootstrap();

    return networkApi.upload();
  } catch (error) {
    console.error(error);
    return;
  }
};

export const useNetworkApi = ({ chainId }: { chainId?: number }) => {
  const {
    data: networkApi,
    isLoading,
    isSuccess
  } = useQuery({
    queryKey: appQueryKeys.networkApi(chainId),
    queryFn: () => bootstrap(chainId),
    staleTime: 1000 * 60 * 60 * 24,
    select: (data) => {
      if (data && chainId) {
        const networkApi = new NetworkApi(chainId);
        networkApi.load(data);
        return networkApi;
      } else {
        return;
      }
    },
    enabled: !!chainId,
    persister
  });

  return {
    networkApi,
    isLoading,
    isSuccess
  };
};
