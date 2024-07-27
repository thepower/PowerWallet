import { takeLatest } from 'typed-redux-saga';
import { manageSagaState } from 'common';
import {
  exportAccountSaga,
  importAccountFromFileSaga,
  loginToWalletSaga,
  resetAccountSaga
} from './accountSaga';
import {
  exportAccount,
  importAccountFromFile,
  loginToWallet,
  resetAccount
} from '../slice/accountSlice';

export default function* () {
  yield* takeLatest(
    importAccountFromFile,
    manageSagaState(importAccountFromFileSaga)
  );
  yield* takeLatest(loginToWallet, manageSagaState(loginToWalletSaga));
  yield* takeLatest(resetAccount, manageSagaState(resetAccountSaga));
  yield* takeLatest(exportAccount, manageSagaState(exportAccountSaga));
}
