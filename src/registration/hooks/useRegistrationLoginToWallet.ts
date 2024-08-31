import { useMutation } from '@tanstack/react-query';

import { AddressApi, CryptoApi } from '@thepowereco/tssdk';
import bs58 from 'bs58';
import { ECPairInterface } from 'ecpair';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAccountLoginToWallet } from 'account/hooks/useAccountLoginToWallet';
import { WalletRoutesEnum } from 'application/typings/routes';
import i18n from 'locales/initTranslation';

type Args = {
  address: string;
  seedOrPrivateKey: string;
  password: string;
};

export const useRegistrationLoginToWallet = ({
  throwOnError
}: {
  throwOnError?: boolean;
}) => {
  const navigate = useNavigate();
  const { loginMutation: accLoginMutation } = useAccountLoginToWallet({
    throwOnError: true
  });
  const loginToWallet = async ({
    address,
    seedOrPrivateKey,
    password
  }: Args) => {
    try {
      AddressApi.parseTextAddress(address);
    } catch (e: any) {
      toast.error(i18n.t('addressIsNotValid'));
      return;
    }

    let isValidSeed = false;
    try {
      isValidSeed = CryptoApi.validateMnemonic(seedOrPrivateKey);
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
          await CryptoApi.generateKeyPairFromSeedPhraseAndAddress(
            seedOrPrivateKey,
            address
          );
        encryptedWif =
          keyPair && CryptoApi.encryptWif(keyPair.toWIF(), password);
      } else if (!isValidSeed && isValidPrivateKey) {
        encryptedWif = CryptoApi.encryptWif(seedOrPrivateKey, password);
      }
      if (encryptedWif) {
        await accLoginMutation({ address, encryptedWif });
        navigate(WalletRoutesEnum.root);
      } else {
        console.error('loginToWalletSaga if (!wif)', encryptedWif);
        toast.error(i18n.t('loginError'));
      }
    } catch (e: any) {
      console.error('loginToWalletSaga isValidSeed', e);
      toast.error(i18n.t('loginError'));
    }
  };

  const { mutateAsync: loginMutation, isPending } = useMutation<
    void,
    Error,
    Args
  >({
    mutationFn: loginToWallet,
    // onSuccess: () => {
    //   navigate(WalletRoutesEnum.root);
    // },
    throwOnError
  });
  return { loginMutation, isPending };
};
