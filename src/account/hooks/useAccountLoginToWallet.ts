import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { GetChainResultType } from 'account/typings/accountTypings';
import appEnvs from 'appEnvs';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import i18n from 'locales/initTranslation';
import { useNetworkApi } from '../../application/hooks';

type Args = {
  address?: string;
  encryptedWif?: string;
};

type ReturnParams = {
  chainId: number;
  address: string;
  encryptedWif: string;
};

export const useAccountLoginToWallet = ({
  throwOnError
}: {
  throwOnError?: boolean;
}) => {
  const { networkApi } = useNetworkApi({
    chainId: appEnvs.DEFAULT_CHAIN_ID
  });
  const { addWallet, wallets } = useWalletsStore();
  const queryClient = useQueryClient();
  const loginToWallet = async ({ address, encryptedWif }: Args) => {
    if (!address || !encryptedWif) {
      console.error('!address || !encryptedWif');
      return;
    }

    const subChain: GetChainResultType =
      await networkApi?.getAddressChain(address);

    queryClient.invalidateQueries({
      queryKey: ['walletData', address]
    });
    return {
      chainId: subChain.chain,
      address,
      encryptedWif
    };
  };

  const { mutateAsync: loginMutation, isPending } = useMutation<
    ReturnParams | undefined,
    Error,
    Args
  >({
    mutationFn: loginToWallet,
    onSuccess: (params) => {
      if (params) {
        addWallet({
          name: 'wallet ' + (wallets.length + 1),
          chainId: params.chainId,
          address: params.address,
          encryptedWif: params.encryptedWif
        });
      }
    },
    onError: (e) => {
      console.error('loginToWalletSaga', e);

      toast.error(`${i18n.t('loginError')} ${e}`);
    },
    throwOnError
  });
  return { loginMutation, isPending };
};
