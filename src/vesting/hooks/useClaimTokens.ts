import { useQueryClient, useMutation } from '@tanstack/react-query';
import { EvmContract } from '@thepowereco/tssdk';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import abis from 'abis';
import appEnvs from 'appEnvs';
import { useNetworkApi } from 'application/hooks';
import { appQueryKeys } from 'application/queryKeys';
import { useWalletsStore } from 'application/utils/localStorageUtils';

type ClaimArgs = {
  wif: string;
  tokenId: string;
};

export const useClaimTokens = () => {
  const { t } = useTranslation();
  const { activeWallet } = useWalletsStore();

  const { networkApi } = useNetworkApi({
    chainId: activeWallet?.chainId
  });

  const queryClient = useQueryClient();

  const { mutateAsync: claimTokens, isPending: isClaimPending } = useMutation<
    void,
    Error,
    ClaimArgs
  >({
    mutationFn: async ({ wif, tokenId }: ClaimArgs) => {
      try {
        if (!networkApi) {
          throw new Error('Network API is not ready');
        }

        if (!activeWallet) {
          throw new Error('Wallet not found');
        }

        const contract = new EvmContract(
          networkApi,
          appEnvs.VESTING_CONTRACT_ADDRESS
        );

        const response = await contract.scSet(
          {
            abi: abis.linearVestingNFT.abi,
            functionName: 'claim',
            args: [BigInt(tokenId)]
          },
          { key: { wif, address: activeWallet.address } }
        );

        if (response?.txId) {
          // Более частое обновление после клейма для получения актуальных данных
          setTimeout(() => {
            queryClient.invalidateQueries({
              queryKey: appQueryKeys.walletData(activeWallet.address),
              refetchInterval: 1000 // Рефетч каждую секунду
            });

            queryClient.invalidateQueries({
              queryKey: appQueryKeys.vestingDetails(
                activeWallet.address,
                tokenId
              ),
              refetchInterval: 1000
            });

            queryClient.invalidateQueries({
              queryKey: appQueryKeys.userVesting(activeWallet.address, tokenId),
              refetchInterval: 1000
            });

            queryClient.invalidateQueries({
              queryKey: appQueryKeys.userVestings(activeWallet.address),
              refetchInterval: 1000
            });
          }, 1000);

          toast.success(t('claimSuccess'));
        }
      } catch (error: any) {
        console.error('Error claiming tokens:', error);
        toast.error(`${t('claimError')} ${error}`);
      }
    }
  });

  return { claimTokens, isClaimPending };
};
