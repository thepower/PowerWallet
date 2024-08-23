import { BigNumber, parseFixed } from '@ethersproject/bignumber';
import {
  AddressApi,
  EvmContract,
  NetworkApi,
  TransactionsApi
} from '@thepowereco/tssdk';
import { correctAmount } from '@thepowereco/tssdk/dist/utils/numbers';
import clone from 'lodash/clone';
import { toast } from 'react-toastify';
import { call, put, select } from 'typed-redux-saga';
import abis from 'abis';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { getNetworkApi, getWalletApi } from 'application/selectors';
import i18n from 'locales/initTranslation';
import { updateTokenAmountSaga } from 'myAssets/sagas/tokens';
import { loadBalanceSaga } from 'myAssets/sagas/wallet';
import { LoadBalancePayloadType } from 'myAssets/types';
import { TxPurpose } from 'sign-and-send/typing';

import {
  sendErc721TokenTrxTrigger,
  sendTokenTrxTrigger,
  sendTrxTrigger,
  setSentData,
  signAndSendTrxTrigger
} from '../slices/sendSlice';

const { packAndSignTX } = TransactionsApi;

export function* sendTrxSaga({
  payload: { wif, to, comment, amount }
}: ReturnType<typeof sendTrxTrigger>) {
  try {
    const WalletAPI = (yield* select(getWalletApi))!;
    const walletAddress = yield* select(getWalletAddress);

    const { txId }: { txId: string; status: string } =
      yield WalletAPI.makeNewTx({
        wif,
        from: walletAddress,
        to,
        token: 'SK',
        inputAmount: amount,
        message: comment ?? ''
      });

    yield* put(
      setSentData({
        txId,
        comment,
        amount,
        from: walletAddress,
        to
      })
    );

    yield loadBalanceSaga();
  } catch (error: any) {
    toast.error(`${i18n.t('anErrorOccurredToken')} ${error}`);
  }
}

export function* sendTokenTrxSaga({
  payload: { wif, to, amount, decimals, address }
}: ReturnType<typeof sendTokenTrxTrigger>) {
  try {
    const networkAPI = (yield* select(getNetworkApi))!;
    const walletAddress = yield* select(getWalletAddress);

    const erc20contract: EvmContract = new EvmContract(
      networkAPI as NetworkApi,
      address
    );

    const calculatedAmount = parseFixed(
      BigNumber.from(amount).toString(),
      decimals
    ).toBigInt();

    const { txId } = yield erc20contract.scSet(
      {
        abi: abis.erc20.abi,
        functionName: 'transfer',
        args: [AddressApi.textAddressToEvmAddress(to), calculatedAmount]
      },
      { key: { wif, address: walletAddress } }
    );

    yield put(
      setSentData({
        txId,
        comment: '',
        amount,
        from: walletAddress,
        to
      })
    );

    yield updateTokenAmountSaga({ address });
  } catch (error: any) {
    console.error(error);
    toast.error(`${i18n.t('anErrorOccurredToken')} ${error}`);
  }
}

export function* sendErc721TokenTrxSaga({
  payload: { wif, to, address, id }
}: ReturnType<typeof sendErc721TokenTrxTrigger>) {
  try {
    const networkAPI = (yield* select(getNetworkApi))!;

    const Erc721Contract: EvmContract = new EvmContract(
      networkAPI as NetworkApi,
      address
    );

    const walletAddress = yield* select(getWalletAddress);

    const { txId } = yield Erc721Contract.scSet(
      {
        abi: abis.erc721.abi,
        functionName: 'transferFrom',
        args: [
          AddressApi.textAddressToEvmAddress(walletAddress),
          AddressApi.textAddressToEvmAddress(to),
          BigInt(id)
        ]
      },
      { key: { wif, address: walletAddress } }
    );

    yield* put(
      setSentData({
        txId,
        comment: '',
        amount: '1',
        from: walletAddress,
        to
      })
    );

    yield updateTokenAmountSaga({ address });
  } catch (error: any) {
    console.error(error);
    toast.error(`${i18n.t('anErrorOccurredToken')} ${error}`);
  }
}

function* getWalletSequence() {
  try {
    const walletAddress = yield* select(getWalletAddress);

    const networkAPI = (yield* select(getNetworkApi))!;

    const sequence = yield* call(networkAPI.getWalletSequence, walletAddress);
    return sequence;
  } catch (error) {
    return 0;
  }
}

export function* singAndSendTrxSaga({
  payload: {
    wif,
    decodedTxBody,
    returnURL,
    additionalActionOnSuccess,
    additionalActionOnError
  }
}: ReturnType<typeof signAndSendTrxTrigger>) {
  try {
    const networkAPI = (yield* select(getNetworkApi))!;

    const walletAddress = yield* select(getWalletAddress);

    const WalletAPI = (yield* select(getWalletApi))!;

    const balance: LoadBalancePayloadType = yield WalletAPI.loadBalance(
      walletAddress!
    );
    const newDecodedTxBody = clone(decodedTxBody);

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
    const sequence = yield* getWalletSequence();
    const newSequence = BigInt(sequence + 1);

    newDecodedTxBody.s = newSequence;

    const txResponse: { txId: string } =
      yield networkAPI.sendTxAndWaitForResponse(
        packAndSignTX(newDecodedTxBody, wif)
      );
    if (txResponse.txId) {
      yield* put(
        setSentData({
          txId: txResponse.txId,
          comment: comment || '',
          amount:
            amount && transferToken ? `${amount} ${transferToken}` : '-' || 0,
          from: walletAddress,
          to,
          returnURL
        })
      );
      additionalActionOnSuccess?.(txResponse);
    } else {
      additionalActionOnError?.(txResponse);
      console.error('singAndSendTrxSagaNoTxId');
    }
  } catch (error: any) {
    additionalActionOnError?.(error?.message);
    console.error('singAndSendTrxSaga', error);
    toast.error(`${i18n.t('somethingWentWrongTransaction')} ${error}`);
  }
}
