import { useMutation } from '@tanstack/react-query';
import { AddressApi, TransactionsApi, WalletApi } from '@thepowereco/tssdk';
import { toast } from 'react-toastify';
import { formatUnits } from 'viem/utils';

import { useStore } from 'application/store';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import i18n from 'locales/initTranslation';
import { LoadBalanceType } from 'myAssets/types';
import { TxBody, TxPurpose } from 'sign-and-send/typing';
import { AddActionOnSuccessAndErrorType } from 'typings/common';
import { useNetworkApi } from '../../application/hooks/useNetworkApi';

const { packAndSignTX } = TransactionsApi;

type Args = AddActionOnSuccessAndErrorType<{
  wif: string;
  decodedTxBody: TxBody;
  returnURL?: string;
}>;

export const useSignAndSendTx = ({
  throwOnError
}: {
  throwOnError?: boolean;
}) => {
  const { activeWallet } = useWalletsStore();

  const { setSentData } = useStore();
  const { networkApi, isLoading: isNetworkApiFetching } = useNetworkApi({
    chainId: activeWallet?.chainId
  });

  const getWalletSequence = async (address: string) => {
    try {
      const sequence = await networkApi?.getWalletSequence(address);
      return sequence;
    } catch (error) {
      return 0;
    }
  };

  const signAndSendTx = async ({
    wif,
    decodedTxBody,
    returnURL,
    additionalActionOnError,
    additionalActionOnSuccess
  }: Args) => {
    try {
      if (!networkApi) {
        throw new Error('Network API is not ready');
      }

      if (!activeWallet) {
        throw new Error('Wallet not found');
      }

      const walletAPI = new WalletApi(networkApi);

      const balance: LoadBalanceType = await walletAPI.loadBalance(
        activeWallet.address
      );

      const newDecodedTxBody = decodedTxBody;

      const fee = newDecodedTxBody?.p?.find(
        (purpose) => purpose?.[0] === TxPurpose.SRCFEE
      );
      const feeAmount = fee?.[2] || 0n;

      const gas = newDecodedTxBody?.p?.find(
        (purpose) => purpose?.[0] === TxPurpose.GAS
      );
      const gasAmount = gas?.[2] || 0n;

      const transfer = newDecodedTxBody?.p?.find(
        (purpose) => purpose?.[0] === TxPurpose.TRANSFER
      );
      const transferAmount = transfer?.[2] || 0n;
      const transferToken = transfer?.[1];

      const totalAmount = feeAmount + gasAmount + transferAmount;

      if (balance?.amount?.SK < totalAmount) {
        toast.error(i18n.t('insufficientFunds'));
        return;
      }

      const amount =
        transferAmount &&
        transferToken &&
        formatUnits(transferAmount, networkApi.decimals[transferToken]);

      const to =
        newDecodedTxBody?.to &&
        AddressApi.hexToTextAddress(newDecodedTxBody.to.toString('hex'));

      const comment = newDecodedTxBody?.e?.msg;
      const sequence = await getWalletSequence(activeWallet.address);
      const newSequence = BigInt(sequence + 1);

      newDecodedTxBody.s = newSequence;

      if (!newDecodedTxBody.f)
        newDecodedTxBody.f = Buffer.from(
          AddressApi.parseTextAddress(activeWallet.address)
        );

      const response = await networkApi.sendTxAndWaitForResponse(
        packAndSignTX(newDecodedTxBody, wif)
      );

      const txId = (response as { txId: string }).txId;

      if (txId) {
        setSentData({
          txId,
          comment: comment || '',
          amount: amount && transferToken ? `${amount} ${transferToken}` : '-',
          from: activeWallet.address,
          to,
          returnURL
        });
        additionalActionOnSuccess?.(response);
      } else {
        additionalActionOnError?.(response);
        console.error('singAndSendTrxSagaNoTxId');
      }
    } catch (error: any) {
      additionalActionOnError?.(error?.message);
      console.error('singAndSendTrxSaga', error);
      toast.error(`${i18n.t('somethingWentWrongTransaction')} ${error}`);
    }
  };

  const { mutateAsync: signAndSendTxMutation, isPending } = useMutation<
    void,
    Error,
    Args
  >({
    mutationFn: signAndSendTx,
    onSuccess: async () => {},
    onError: (e) => {
      console.error('loginToWalletSaga', e);

      toast.error(i18n.t('loginError') + ` ${e?.message}`);
    },
    throwOnError
  });
  return { signAndSendTxMutation, isPending, isFetching: isNetworkApiFetching };
};
