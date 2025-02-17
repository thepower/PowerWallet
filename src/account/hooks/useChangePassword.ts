import { useCallback } from 'react';
import { CryptoApi } from '@thepowereco/tssdk';
import { toast } from 'react-toastify';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import i18n from 'locales/initTranslation';
import { AddActionOnSuccessAndDecryptType } from 'typings/common';

type Args = AddActionOnSuccessAndDecryptType<{
  oldPassword: string;
  newPassword: string;
  isWithoutPassword?: boolean;
}>;

export const useChangePassword = () => {
  const { activeWallet, updateWallet } = useWalletsStore();

  const changePassword = useCallback(
    async ({
      oldPassword,
      newPassword,
      isWithoutPassword,
      additionalActionOnSuccess,
      additionalActionOnDecryptError
    }: Args) => {
      try {
        if (!activeWallet) {
          throw new Error('Wallet not found');
        }

        let decryptedWif: string;
        try {
          decryptedWif = CryptoApi.decryptWif(
            activeWallet.encryptedWif,
            oldPassword
          );
        } catch (e) {
          if (oldPassword !== '') {
            try {
              decryptedWif = CryptoApi.decryptWif(
                activeWallet.encryptedWif,
                ''
              );
            } catch (e) {
              throw new Error('unable to decrypt data');
            }
          } else {
            throw new Error('unable to decrypt data');
          }
        }

        const newEncryptedWif = isWithoutPassword
          ? CryptoApi.encryptWif(decryptedWif, '')
          : CryptoApi.encryptWif(decryptedWif, newPassword);

        updateWallet(activeWallet.address, { encryptedWif: newEncryptedWif });

        toast.success(i18n.t('passwordChanged'));
        additionalActionOnSuccess?.();
      } catch (e: any) {
        if (
          additionalActionOnDecryptError &&
          e.message === 'unable to decrypt data'
        ) {
          additionalActionOnDecryptError?.();
        } else {
          toast.error(i18n.t('passwordChangeError'));
        }
      }
    },
    [activeWallet, updateWallet]
  );

  return { changePassword };
};
