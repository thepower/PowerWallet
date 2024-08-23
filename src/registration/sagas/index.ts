import { takeLatest } from 'typed-redux-saga';
import manageSagaState from 'common/manageSagaState';
import {
  createWalletSaga,
  generateSeedPhraseSaga,
  loginToWalletSaga,
  proceedToWalletSaga
} from './registrationSaga';
import {
  createWallet,
  generateSeedPhrase,
  loginToWalletFromRegistration,
  proceedToWallet
} from '../slice/registrationSlice';

export default function* () {
  yield* takeLatest(
    generateSeedPhrase,
    manageSagaState(generateSeedPhraseSaga)
  );
  yield* takeLatest(
    loginToWalletFromRegistration,
    manageSagaState(loginToWalletSaga)
  );
  yield* takeLatest(createWallet, manageSagaState(createWalletSaga));
  yield* takeLatest(proceedToWallet, manageSagaState(proceedToWalletSaga));
}
