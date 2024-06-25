import { call, put, select } from 'typed-redux-saga';
import { CryptoApi, WalletApi } from '@thepowereco/tssdk';
import fileSaver from 'file-saver';
import { FileReaderType, getFileData } from 'common';
import { push } from 'connected-react-router';
import { toast } from 'react-toastify';
import i18n from 'locales/initTranslation';
import { getSelectedChain } from 'registration/selectors/registrationSelectors';
import {
  clearAccountData,
  exportAccount,
  importAccountFromFile,
  resetAccount,
  setWalletData,
} from '../slice/accountSlice';
import { getWalletData } from '../selectors/accountSelectors';
import {
  GetChainResultType,
  LoginToWalletSagaInput,
} from '../typings/accountTypings';
import { clearApplicationStorage, setKeyToApplicationStorage } from '../../application/utils/localStorageUtils';
import { getNetworkApi, getNetworkChainID } from '../../application/selectors';
import { WalletRoutesEnum } from '../../application/typings/routes';
import { reInitApis } from '../../application/sagas/initApplicationSaga';
import { loadBalanceTrigger } from '../../myAssets/slices/walletSlice';

export function* loginToWalletSaga({ payload }: { payload?: LoginToWalletSagaInput } = {}) {
  const { address, encryptedWif } = payload!;
  let NetworkAPI = (yield* select(getNetworkApi))!;

  try {
    let subChain: GetChainResultType;

    do {
      subChain = yield NetworkAPI.getAddressChain(address!);

      if (subChain.result === 'other_chain') {
        if (subChain.chain === null) {
          toast.error(i18n.t('portationInProgress'));
          return;
        }

        const { networkApi } = yield* reInitApis({ payload: subChain.chain });
        NetworkAPI = networkApi;
      }
    } while (subChain.result !== 'found');

    yield setKeyToApplicationStorage('address', address);
    yield setKeyToApplicationStorage('wif', encryptedWif);
    yield* put(setWalletData({
      address: payload?.address!,
      encryptedWif: payload?.encryptedWif!,
    }));

    yield* put(loadBalanceTrigger());
  } catch (e) {
    console.error('loginToWalletSaga', e);

    toast.error(i18n.t(`loginError${e}`));
  }
}

export function* importAccountFromFileSaga({ payload }: ReturnType<typeof importAccountFromFile>) {
  const { accountFile, password, additionalActionOnDecryptError } = payload;

  try {
    const data = yield* call(getFileData, accountFile, FileReaderType.binary);
    const walletData = yield* call(WalletApi.parseExportData, data!, password);
    const encryptedWif = yield* call(CryptoApi.encryptWif, walletData.wif!, password);

    yield* loginToWalletSaga({ payload: { address: walletData.address, encryptedWif } });
    yield* put(push(WalletRoutesEnum.root));
  } catch (e: any) {
    if (additionalActionOnDecryptError && e.message === 'unable to decrypt data') {
      additionalActionOnDecryptError?.();
    } else {
      toast.error(i18n.t('importAccountError'));
    }
  }
}

export function* exportAccountSaga({ payload }: ReturnType<typeof exportAccount>) {
  const { encryptedWif, address } = yield* select(getWalletData);
  const {
    password, hint, isWithoutGoHome, additionalActionOnSuccess, additionalActionOnDecryptError,
  } = payload;
  const currentNetworkChain = yield* select(getNetworkChainID);
  const currentRegistrationChain = yield* select(getSelectedChain);
  try {
    const decryptedWif: string = yield CryptoApi.decryptWif(encryptedWif, password);
    const exportedData: string = yield WalletApi.getExportData(decryptedWif, address, password, hint);

    const blob: Blob = yield new Blob([exportedData], { type: 'octet-stream' });

    yield* loginToWalletSaga({ payload: { address, encryptedWif } });

    const fileName = currentNetworkChain || currentRegistrationChain ?
      `power_wallet_${currentRegistrationChain || currentNetworkChain}_${address}.pem` :
      `power_wallet_${address}.pem`;

    yield fileSaver.saveAs(blob, fileName, { autoBom: true });

    if (!isWithoutGoHome) {
      yield put(push(WalletRoutesEnum.root));
    }

    additionalActionOnSuccess?.();
  } catch (e: any) {
    console.error('exportAccountSaga', e);

    if (additionalActionOnDecryptError && e.message === 'unable to decrypt data') {
      additionalActionOnDecryptError?.();
    } else {
      toast.error(i18n.t('exportAccountError'));
    }
  }
}

export function* resetAccountSaga({ payload: { password, additionalActionOnDecryptError } }: ReturnType<typeof resetAccount>) {
  const { encryptedWif } = yield* select(getWalletData);
  try {
    yield CryptoApi.decryptWif(encryptedWif, password);
    yield clearApplicationStorage();
    yield put(clearAccountData());
    yield put(push(WalletRoutesEnum.root));
  } catch (e: any) {
    if (additionalActionOnDecryptError && e.message === 'unable to decrypt data') {
      additionalActionOnDecryptError?.();
    } else {
      toast.error(i18n.t('resetAccountError'));
    }
  }
}
