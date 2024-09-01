import { useMutation } from '@tanstack/react-query';
import { AddressApi, EvmContract } from '@thepowereco/tssdk';
import { toast } from 'react-toastify';
import abis from 'abis';

import { useWallets } from 'application/utils/localStorageUtils';
import i18n from 'locales/initTranslation';
import { useNetworkApi } from '../../application/hooks/useNetworkApi';

type Args = {
  wif: string;
  to: string;
  address: string;
  id: string;
};

export const useSendErc721TokenTx = ({
  throwOnError
}: {
  throwOnError?: boolean;
}) => {
  const { activeWallet } = useWallets();
  const { networkApi, isLoading: isNetworkApiFetching } = useNetworkApi({
    chainId: activeWallet?.chainId
  });
  const sendErc721TokenTx = async ({ wif, to, address, id }: Args) => {
    if (!networkApi) {
      throw new Error('Network API is not ready');
    }

    if (!activeWallet) {
      throw new Error('Wallet not found');
    }

    try {
      const Erc721Contract: EvmContract = new EvmContract(networkApi, address);

      await Erc721Contract.scSet(
        {
          abi: abis.erc721.abi,
          functionName: 'transferFrom',
          args: [
            AddressApi.textAddressToEvmAddress(activeWallet.address),
            AddressApi.textAddressToEvmAddress(to),
            BigInt(id)
          ]
        },
        { key: { wif, address: activeWallet.address } }
      );

      // yield *
      //   put(
      //     setSentData({
      //       txId,
      //       comment: '',
      //       amount: '1',
      //       from: walletAddress,
      //       to
      //     })
      //   );

      // yield updateTokenAmountSaga({ address });
    } catch (error: any) {
      console.error(error);
      toast.error(`${i18n.t('anErrorOccurredToken')} ${error}`);
    }
  };

  const { mutateAsync: sendErc721TokenTxMutation, isPending } = useMutation<
    void,
    Error,
    Args
  >({
    mutationFn: sendErc721TokenTx,
    onSuccess: async () => {},
    onError: (e) => {
      console.error('loginToWalletSaga', e);

      toast.error(i18n.t(`loginError${e}`));
    },
    throwOnError
  });
  return {
    sendErc721TokenTxMutation,
    isPending,
    isFetching: isNetworkApiFetching
  };
};
