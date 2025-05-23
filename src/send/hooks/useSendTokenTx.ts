import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AddressApi, EvmContract } from '@thepowereco/tssdk';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem/utils';
import abis from 'abis';
import { appQueryKeys } from 'application/queryKeys';
import { useStore } from 'application/store';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import i18n from 'locales/initTranslation';
import { useNetworkApi } from '../../application/hooks/useNetworkApi';

type Args = {
  wif: string;
  to: string;
  address: string;
  decimals: number;
  amount: string;
};

export const useSendTokenTx = ({
  throwOnError
}: {
  throwOnError?: boolean;
}) => {
  const { activeWallet } = useWalletsStore();
  const { setSentData } = useStore();

  const { networkApi, isLoading: isNetworkApiFetching } = useNetworkApi({
    chainId: activeWallet?.chainId
  });
  const queryClient = useQueryClient();

  const { mutateAsync: sendTokenTxMutation, isPending } = useMutation<
    void,
    Error,
    Args
  >({
    mutationFn: async ({ wif, to, amount, decimals, address }: Args) => {
      try {
        if (!networkApi) {
          throw new Error('Network API is not ready');
        }

        if (!activeWallet) {
          throw new Error('Wallet not found');
        }

        const erc20contract: EvmContract = new EvmContract(networkApi, address);

        const calculatedAmount = parseUnits(amount, +decimals);

        const response = await erc20contract.scSet(
          {
            abi: abis.erc20.abi,
            functionName: 'transfer',
            args: [
              AddressApi.isTextAddressValid(to)
                ? AddressApi.textAddressToEvmAddress(to)
                : (to as `0x${string}`),
              calculatedAmount
            ]
          },
          { key: { wif, address: activeWallet.address } }
        );

        if (response?.txId) {
          setSentData({
            txId: response.txId,
            comment: '',
            amount,
            from: activeWallet.address,
            to
          });

          queryClient.invalidateQueries({
            queryKey: appQueryKeys.tokenBalance(activeWallet?.address, address)
          });
          queryClient.invalidateQueries({
            queryKey: appQueryKeys.tokenBalance(to, address)
          });
          queryClient.invalidateQueries({
            queryKey: appQueryKeys.tokenTransactionsHistory(to, address)
          });
        }
      } catch (error: any) {
        console.error(error);
        toast.error(`${i18n.t('anErrorOccurredToken')} ${error}`);
      }
    },
    onError: (e) => {
      console.error('loginToWalletSaga', e);

      toast.error(i18n.t(`loginError${e}`));
    },
    throwOnError
  });
  return { sendTokenTxMutation, isPending, isFetching: isNetworkApiFetching };
};
