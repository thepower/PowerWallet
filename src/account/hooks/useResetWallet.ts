import { useCallback } from 'react';
import { CryptoApi } from '@thepowereco/tssdk';
import { useNavigate } from 'react-router-dom';
import { RoutesEnum } from 'application/typings/routes';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { AddActionOnSuccessAndDecryptType } from 'typings/common';
type Args = AddActionOnSuccessAndDecryptType<{
  password: string;
}>;

export const useResetWallet = () => {
  const { activeWallet, removeWallet } = useWalletsStore();

  const navigate = useNavigate();
  const resetWallet = useCallback(
    async ({
      password,
      additionalActionOnSuccess,
      additionalActionOnDecryptError
    }: Args) => {
      try {
        if (!activeWallet) {
          throw new Error('Wallet not found');
        }

        CryptoApi.decryptWif(activeWallet.encryptedWif, password);
        removeWallet(activeWallet.address);
        navigate(RoutesEnum.root);
        additionalActionOnSuccess?.();
      } catch (e: any) {
        if (
          additionalActionOnDecryptError &&
          e.message === 'unable to decrypt data'
        ) {
          additionalActionOnDecryptError?.();
        }
      }
    },
    [activeWallet, removeWallet, navigate]
  );

  return { resetWallet };
};
