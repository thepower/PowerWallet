import { takeLatest } from 'typed-redux-saga';
import manageSagaState from 'common/manageSagaState';
import {
  addTokenTrigger,
  getErc721TokensTrigger,
  updateTokensAmountsTrigger
} from 'myAssets/slices/tokensSlice';
import { loadTransactionsTrigger } from 'myAssets/slices/transactionsSlice';
import {
  addTokenSaga,
  getErc721TokensSaga,
  updateTokensAmountsSaga
} from './tokens';
import { loadBalanceSaga, loadTransactionsSaga } from './wallet';
import { loadBalanceTrigger } from '../slices/walletSlice';

export default function* assetsSaga() {
  yield* takeLatest(loadBalanceTrigger, manageSagaState(loadBalanceSaga));
  yield* takeLatest(
    loadTransactionsTrigger,
    manageSagaState(loadTransactionsSaga)
  );
  yield* takeLatest(addTokenTrigger, manageSagaState(addTokenSaga));
  yield* takeLatest(
    updateTokensAmountsTrigger,
    manageSagaState(updateTokensAmountsSaga)
  );

  yield* takeLatest(
    getErc721TokensTrigger,
    manageSagaState(getErc721TokensSaga)
  );
}
