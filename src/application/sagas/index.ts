import { takeLatest } from 'typed-redux-saga';
import manageSagaState from 'common/manageSagaState';
import { initApplicationSaga } from './initApplicationSaga';
import { initApplication } from '../slice/applicationSlice';

export default function* applicationSaga() {
  yield* takeLatest(initApplication, manageSagaState(initApplicationSaga));
}
