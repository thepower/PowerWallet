import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WalletApi } from '@thepowereco/tssdk';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem/utils';
import { appQueryKeys } from 'application/queryKeys';
import { useStore } from 'application/store';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import i18n from 'locales/initTranslation';
import { Maybe } from 'typings/common';
import { useNetworkApi } from '../../application/hooks/useNetworkApi';

type Args = {
  wif: string;
  to: string;
  amount: string;
  comment: Maybe<string>;
};

export const useSendTx = ({
  throwOnError = false
}: {
  throwOnError?: boolean;
}) => {
  const { activeWallet } = useWalletsStore();

  const { setSentData } = useStore();

  const { networkApi, isLoading: isNetworkApiFetching } = useNetworkApi({
    chainId: activeWallet?.chainId
  });
  const queryClient = useQueryClient();
  const sendTx = async ({ wif, to, comment, amount }: Args) => {
    try {
      if (!networkApi) {
        throw new Error('Network API is not ready');
      }

      if (!activeWallet) {
        throw new Error('Wallet not found');
      }
      const walletApi = new WalletApi(networkApi);

      const token = 'SK';

      const response = await walletApi.makeNewTx({
        wif,
        from: activeWallet.address,
        to,
        token,
        inputAmount: parseUnits(amount, networkApi.decimals[token]),
        message: comment ?? ''
      });

      const { txId } = response as { txId: string; status: string };

      setSentData({
        txId,
        comment,
        amount,
        from: activeWallet.address,
        to
      });

      queryClient.invalidateQueries({
        queryKey: appQueryKeys.walletData(activeWallet.address)
      });
      queryClient.invalidateQueries({
        queryKey: appQueryKeys.walletData(to)
      });
    } catch (error: any) {
      toast.error(`${i18n.t('anErrorOccurredToken')} ${error}`);
    }
  };

  const { mutateAsync: sendTxMutation, isPending } = useMutation<
    void,
    Error,
    Args
  >({
    mutationFn: sendTx,
    onSuccess: async () => {},
    onError: (e) => {
      console.error('loginToWalletSaga', e);

      toast.error(i18n.t(`loginError${e}`));
    },
    throwOnError
  });
  return { sendTxMutation, isPending, isFetching: isNetworkApiFetching };
};
