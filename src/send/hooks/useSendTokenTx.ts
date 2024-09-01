import { BigNumber, parseFixed } from '@ethersproject/bignumber';
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
  decimals: string;
  amount: number;
};

export const useSendTokenTx = ({
  throwOnError
}: {
  throwOnError?: boolean;
}) => {
  const { activeWallet } = useWallets();
  const { networkApi, isLoading: isNetworkApiFetching } = useNetworkApi({
    chainId: activeWallet?.chainId
  });
  const sendTokenTx = async ({ wif, to, amount, decimals, address }: Args) => {
    try {
      if (!networkApi) {
        throw new Error('Network API is not ready');
      }

      if (!activeWallet) {
        throw new Error('Wallet not found');
      }

      const erc20contract: EvmContract = new EvmContract(networkApi, address);

      const calculatedAmount = parseFixed(
        BigNumber.from(amount).toString(),
        decimals
      ).toBigInt();

      await erc20contract.scSet(
        {
          abi: abis.erc20.abi,
          functionName: 'transfer',
          args: [AddressApi.textAddressToEvmAddress(to), calculatedAmount]
        },
        { key: { wif, address: activeWallet.address } }
      );

      // yield put(
      //   setSentData({
      //     txId,
      //     comment: '',
      //     amount,
      //     from: walletAddress,
      //     to
      //   })
      // );

      // yield updateTokenAmountSaga({ address });
    } catch (error: any) {
      console.error(error);
      toast.error(`${i18n.t('anErrorOccurredToken')} ${error}`);
    }
  };

  const { mutateAsync: sendTokenTxMutation, isPending } = useMutation<
    void,
    Error,
    Args
  >({
    mutationFn: sendTokenTx,
    onSuccess: async () => {},
    onError: (e) => {
      console.error('loginToWalletSaga', e);

      toast.error(i18n.t(`loginError${e}`));
    },
    throwOnError
  });
  return { sendTokenTxMutation, isPending, isFetching: isNetworkApiFetching };
};
