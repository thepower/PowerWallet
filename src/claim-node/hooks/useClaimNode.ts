import { useQueryClient, useMutation } from '@tanstack/react-query';
import { EvmContract } from '@thepowereco/tssdk';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import abis from 'abis';
import appEnvs from 'appEnvs';
import { useNetworkApi } from 'application/hooks';
import { appQueryKeys } from 'application/queryKeys';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { useAddToken } from 'myAssets/hooks';

export const useClaimNode = () => {
  const { t } = useTranslation();
  const { activeWallet } = useWalletsStore();
  const { addTokenMutation } = useAddToken({ throwOnError: true });
  const { networkApi } = useNetworkApi({
    chainId: activeWallet?.chainId
  });

  const queryClient = useQueryClient();

  const { mutateAsync: claimNode, isPending: isClaimPending } = useMutation<
    void,
    Error,
    { wif: string }
  >({
    mutationFn: async ({ wif }) => {
      try {
        if (!networkApi) {
          throw new Error('Network API is not ready');
        }

        if (!activeWallet) {
          throw new Error('Wallet not found');
        }

        const contract = new EvmContract(
          networkApi,
          appEnvs.CLAIM_NODE_CONTRACT_ADDRESS
        );

        const response = await contract.scSet(
          {
            abi: abis.claimNode.abi,
            functionName: 'claim',
            args: []
          },
          { key: { wif, address: activeWallet.address } }
        );

        if (response?.txId) {
          setTimeout(() => {
            queryClient.invalidateQueries({
              queryKey: appQueryKeys.walletData(activeWallet.address)
            });
            queryClient.invalidateQueries({
              queryKey: appQueryKeys.claimNodeStatus(activeWallet?.address)
            });
          }, 1000);

          toast.success(t('nodeClaimSuccess'));
        }

        const nftCollection = await contract.scGet({
          abi: abis.claimNode.abi,
          functionName: 'nftCollection',
          args: []
        });

        if (nftCollection) {
          addTokenMutation({ address: nftCollection, withoutRedirect: true });
        }
      } catch (error: any) {
        console.error('Error claiming node:', error);
        toast.error(`${t('nodeClaimError')} ${error}`);
      }
    }
  });

  return { claimNode, isClaimPending };
};
