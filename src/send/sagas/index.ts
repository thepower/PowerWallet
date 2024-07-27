import { takeLatest } from 'typed-redux-saga';
import { manageSagaState } from 'common';
import {
  sendTrxSaga,
  sendTokenTrxSaga,
  singAndSendTrxSaga,
  sendErc721TokenTrxSaga
} from './sendSagas';
import {
  sendTrxTrigger,
  sendTokenTrxTrigger,
  signAndSendTrxTrigger,
  sendErc721TokenTrxTrigger
} from '../slices/sendSlice';

export default function* sendSagas() {
  yield* takeLatest(sendTrxTrigger, manageSagaState(sendTrxSaga));
  yield* takeLatest(sendTokenTrxTrigger, manageSagaState(sendTokenTrxSaga));
  yield* takeLatest(signAndSendTrxTrigger, manageSagaState(singAndSendTrxSaga));
  yield* takeLatest(
    sendErc721TokenTrxTrigger,
    manageSagaState(sendErc721TokenTrxSaga)
  );
}
