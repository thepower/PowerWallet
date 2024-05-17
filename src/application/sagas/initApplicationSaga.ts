import { call, put, select } from 'typed-redux-saga';
import { push, createMatchSelector } from 'connected-react-router';
import { NetworkApi, WalletApi } from '@thepowereco/tssdk';
import { setDynamicApis, setNetworkChains } from '../slice/applicationSlice';
import { getKeyFromApplicationStorage } from '../utils/localStorageUtils';
import { loginToWalletSaga } from '../../account/sagas/accountSaga';
import { setWalletData } from '../../account/slice/accountSlice';
import { WalletRoutesEnum } from '../typings/routes';

export const defaultChain = 1025; // TODO: move to config

export function* reInitApis({ payload }: { payload: number }) {
  const networkApi = new NetworkApi(payload || defaultChain);
  yield networkApi.bootstrap(true);

  const walletApi = new WalletApi(networkApi);

  yield* put(setDynamicApis({ networkApi, walletApi }));

  return { walletApi, networkApi };
}

export function* initApplicationSaga() {
  yield* reInitApis({ payload: defaultChain });
  let address = '';
  let encryptedWif = '';

  const config = yield* call(NetworkApi.getChainGlobalConfig);

  yield put(setNetworkChains(config.settings));

  address = yield getKeyFromApplicationStorage('address');

  encryptedWif = yield getKeyFromApplicationStorage('wif');

  const matchSelector = createMatchSelector({ path: WalletRoutesEnum.registrationForApps });
  const match = yield* select(matchSelector);

  if (address && encryptedWif) {
    yield loginToWalletSaga({
      payload: {
        address,
        encryptedWif,
      },
    });

    yield* put(setWalletData({
      address,
      encryptedWif,
      logged: true,
    }));

    yield* put(push(window.location.pathname));
  } else if (!match) {
    yield* put(push(WalletRoutesEnum.signup));
  }
}
