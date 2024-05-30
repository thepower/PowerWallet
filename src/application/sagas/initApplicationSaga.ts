import { call, put, select } from 'typed-redux-saga';
import { push, createMatchSelector } from 'connected-react-router';
import { AddressApi, NetworkApi, WalletApi } from '@thepowereco/tssdk';
import { getRouterParamsDataOrReferrer } from 'router/selectors';
import { toast } from 'react-toastify';
import i18n from 'locales/initTranslation';
import { setDynamicApis, setNetworkChains } from '../slice/applicationSlice';
import { getKeyFromApplicationStorage } from '../utils/localStorageUtils';
import { loginToWalletSaga } from '../../account/sagas/accountSaga';
import { setWalletData } from '../../account/slice/accountSlice';
import { WalletRoutesEnum } from '../typings/routes';

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

  const matchSelector = createMatchSelector({
    path: [
      `${WalletRoutesEnum.signup}/:dataOrReferrer?`,
      `${WalletRoutesEnum.sso}/:data?`,
    ],
  });
  const match = yield* select(matchSelector);
  const dataOrReferrer = yield* select(getRouterParamsDataOrReferrer);

  if (address && encryptedWif) {
    yield loginToWalletSaga({
      payload: {
        address,
        encryptedWif,
      },
    });

    yield* put(
      setWalletData({
        address,
        encryptedWif,
      }),
    );

    const isAddressInParams =
      dataOrReferrer && AddressApi.isTextAddressValid(dataOrReferrer);
    if (isAddressInParams) {
      toast.warning(i18n.t('sorryReferralLinkIsOnly'));
      yield* put(push(WalletRoutesEnum.root));
    } else {
      yield* put(push(window.location.pathname));
    }
  } else if (!match) {
    if (dataOrReferrer) {
      console.log({ dataOrReferrer });
      yield* put(push(`${WalletRoutesEnum.signup}/${dataOrReferrer}`));
    } else {
      yield* put(push(WalletRoutesEnum.signup));
    }
  }
}
