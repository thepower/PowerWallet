import { useMutation } from '@tanstack/react-query';
import { AddressApi, TransactionsApi, WalletApi } from '@thepowereco/tssdk';
import { correctAmount } from '@thepowereco/tssdk/dist/utils/numbers';
import { toast } from 'react-toastify';

import { useWallets } from 'application/utils/localStorageUtils';
import i18n from 'locales/initTranslation';
import { LoadBalanceType } from 'myAssets/types';
import { TxBody, TxPurpose } from 'sign-and-send/typing';
import { useNetworkApi } from '../../application/hooks/useNetworkApi';
const { packAndSignTX } = TransactionsApi;

type Args = {
  wif: string;
  decodedTxBody: TxBody;
  returnURL?: string;
};

export const useSignAndSendTx = ({
  throwOnError
}: {
  throwOnError?: boolean;
}) => {
  const { activeWallet } = useWallets();
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

  const signAndSendTx = async ({ wif, decodedTxBody, returnURL }: Args) => {
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
      const feeAmount = fee?.[2] || 0;

      const gas = newDecodedTxBody?.p?.find(
        (purpose) => purpose?.[0] === TxPurpose.GAS
      );
      const gasAmount = gas?.[2] || 0;

      const transfer = newDecodedTxBody?.p?.find(
        (purpose) => purpose?.[0] === TxPurpose.TRANSFER
      );
      const transferAmount = transfer?.[2] || 0;
      const transferToken = transfer?.[1];

      const totalAmount = feeAmount + gasAmount + transferAmount;
      const correctedTotalCommissionAmount =
        totalAmount && correctAmount(totalAmount, 'SK');

      if (balance?.amount?.SK < correctedTotalCommissionAmount) {
        toast.error(i18n.t('insufficientFunds'));
        return;
      }

      const amount =
        transferAmount &&
        transferToken &&
        correctAmount(transferAmount, transferToken);

      const to =
        newDecodedTxBody?.to &&
        AddressApi.hexToTextAddress(
          Buffer.from(newDecodedTxBody.to).toString('hex')
        );

      const comment = newDecodedTxBody?.e?.msg;
      const sequence = await getWalletSequence(activeWallet.address);
      const newSequence = BigInt(sequence + 1);

      newDecodedTxBody.s = newSequence;

      const response = await networkApi.sendTxAndWaitForResponse(
        packAndSignTX(newDecodedTxBody, wif)
      );

      const txId = (response as { txId: string }).txId;

      if (txId) {
        // yield *
        //   put(
        //     setSentData({
        //       txId,
        //       comment: comment || '',
        //       amount:
        //         amount && transferToken
        //           ? `${amount} ${transferToken}`
        //           : '-' || 0,
        //       from: walletAddress,
        //       to,
        //       returnURL
        //     })
        //   );
        // additionalActionOnSuccess?.(txResponse);
      } else {
        // additionalActionOnError?.(txResponse);
        console.error('singAndSendTrxSagaNoTxId');
      }
    } catch (error: any) {
      // additionalActionOnError?.(error?.message);
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

      toast.error(i18n.t(`loginError${e}`));
    },
    throwOnError
  });
  return { signAndSendTxMutation, isPending, isFetching: isNetworkApiFetching };
};
