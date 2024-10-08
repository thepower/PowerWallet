import { all, call, spawn } from 'typed-redux-saga';
import applicationSaga from './index';
import accountSaga from '../../account/sagas';
import assetsSaga from '../../myAssets/sagas';
import registrationSaga from '../../registration/sagas';
import sendSagas from '../../send/sagas';

export default function* rootSaga() {
  const sagas = [
    applicationSaga,
    accountSaga,
    registrationSaga,
    assetsSaga,
    sendSagas
  ];

  yield* all(
    sagas.map((saga) =>
      spawn(function* () {
        while (true) {
          try {
            yield* call(saga);
            break;
          } catch (err) {
            console.error(err);
          }
        }
      })
    )
  );
}
