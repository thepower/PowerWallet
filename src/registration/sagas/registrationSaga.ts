import {
  AddressApi,
  CryptoApi,
  RegisteredAccount,
  WalletApi,
} from '@thepowereco/tssdk';
import { push } from 'connected-react-router';
import { toast } from 'react-toastify';
import { put, select } from 'typed-redux-saga';
import i18n from 'locales/initTranslation';
import {
  ECPairInterface,
} from 'ecpair';
import bs58 from 'bs58';
import { getWalletData } from '../../account/selectors/accountSelectors';
import { loginToWallet, setWalletData } from '../../account/slice/accountSlice';
import { WalletRoutesEnum } from '../../application/typings/routes';
import {
  getSelectedChain, getGeneratedSeedPhrase, getSelectedNetwork, getIsRandomChain,
} from '../selectors/registrationSelectors';
import { createWallet, loginToWalletFromRegistration, setSeedPhrase } from '../slice/registrationSlice';
import { CreateAccountStepsEnum } from '../typings/registrationTypes';

export function* generateSeedPhraseSaga() {
  const phrase: string = yield CryptoApi.generateSeedPhrase();

  yield* put(setSeedPhrase({
    seedPhrase: phrase,
    nextStep: CreateAccountStepsEnum.backup,
  }));
}

export function* createWalletSaga({ payload }: ReturnType<typeof createWallet>) {
  const { password, additionalActionOnSuccess } = payload;
  const seedPhrase = yield* select(getGeneratedSeedPhrase);
  const isRandomChain = yield* select(getIsRandomChain);
  const network = yield* select(getSelectedNetwork);

  const chain = yield* select(getSelectedChain);
  let account: RegisteredAccount;

  if (!isRandomChain && !chain) return;

  try {
    if (isRandomChain) {
      if (network) {
        account = yield WalletApi.registerRandomChain(network, seedPhrase!);
      } else {
        return;
      }
    } else {
      account = yield WalletApi.registerCertainChain(chain!, seedPhrase!);
    }

    const encryptedWif = CryptoApi.encryptWif(account.wif, password);

    yield put(setWalletData({
      address: account.address,
      encryptedWif,
    }));

    additionalActionOnSuccess?.();
  } catch (e) {
    console.error('createWalletSaga', e);
    toast.error(i18n.t('createAccountError'));
  }
}

export function* loginToWalletSaga({ payload }: ReturnType<typeof loginToWalletFromRegistration>) {
  const {
    address, seedOrPrivateKey, password,
  } = payload;

  try {
    yield AddressApi.parseTextAddress(address);
  } catch (e: any) {
    toast.error(i18n.t('addressIsNotValid'));
    return;
  }

  let isValidSeed = false;
  try {
    isValidSeed = yield CryptoApi.validateMnemonic(seedOrPrivateKey);
  } catch (e: any) {
    console.error('loginToWalletSaga isValidSeed', e);
  }

  let isValidPrivateKey = null;
  if (!isValidSeed) {
    try {
      isValidPrivateKey = bs58.decode(seedOrPrivateKey);
    } catch (e: any) {
      toast.error(i18n.t('addressIsNotValid'));
      return;
    }
  }

  try {
    let encryptedWif = null;
    if (isValidSeed) {
      const keyPair: ECPairInterface =
        yield CryptoApi.generateKeyPairFromSeedPhraseAndAddress(seedOrPrivateKey, address);
      encryptedWif = keyPair && CryptoApi.encryptWif(keyPair.toWIF(), password);
    } else if (!isValidSeed && isValidPrivateKey) {
      encryptedWif = CryptoApi.encryptWif(seedOrPrivateKey, password);
    }
    if (encryptedWif) {
      yield* put(loginToWallet({ address, encryptedWif }));
      yield* put(push(WalletRoutesEnum.root));
    } else {
      console.error('loginToWalletSaga if (!wif)', encryptedWif);
      toast.error(i18n.t('loginError'));
    }
  } catch (e: any) {
    console.error('loginToWalletSaga isValidSeed', e);
    toast.error(i18n.t('loginError'));
  }
}

export function* proceedToWalletSaga() {
  const { encryptedWif, address } = yield* select(getWalletData);
  yield* put(loginToWallet({ address, encryptedWif }));
  yield* put(push(WalletRoutesEnum.root));
}
