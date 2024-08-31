import { NetworkApi, WalletApi } from '@thepowereco/tssdk';
import { push, createMatchSelector } from 'connected-react-router';
import { call, put, select } from 'typed-redux-saga';
import { loginToWalletSaga } from '../../account/sagas/accountSaga';
import { setWalletData } from '../../account/slice/accountSlice';
import { setDynamicApis, setNetworkChains } from '../slice/applicationSlice';
import { WalletRoutesEnum } from '../typings/routes';
import { getKeyFromApplicationStorage } from '../utils/localStorageUtils';

export const defaultChain = 1025; // TODO: move to config

export function* reInitApis({ payload }: { payload: number }) {
  const networkApi = new NetworkApi(payload || defaultChain);
  yield networkApi.bootstrap();

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

  // const matchSelector = createMatchSelector({
  //   path: [
  //     `${WalletRoutesEnum.signup}/:dataOrReferrer?`,
  //     `${WalletRoutesEnum.sso}/:data?`
  //   ]
  // });

  // const match = yield* select(matchSelector);

  if (address && encryptedWif) {
    yield loginToWalletSaga({
      payload: {
        address,
        encryptedWif
      }
    });

    yield* put(
      setWalletData({
        address,
        encryptedWif
      })
    );

    yield* put(push(window.location.pathname));
  }
  // else if (!match) {
  //   yield* put(push(WalletRoutesEnum.root));
  // }
}
