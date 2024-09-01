import { useCallback } from 'react';
import { CryptoApi } from '@thepowereco/tssdk';
import { useNavigate } from 'react-router-dom';
import { WalletRoutesEnum } from 'application/typings/routes';
import { useWallets } from 'application/utils/localStorageUtils';
import { AddActionOnSuccessAndDecryptType } from 'typings/common';
type Args = AddActionOnSuccessAndDecryptType<{
  password: string;
}>;

export const useResetWallet = () => {
  const { activeWallet, removeWallet } = useWallets();
  const navigate = useNavigate();
  const resetWallet = useCallback(
    async ({
      password,
      additionalActionOnSuccess,
      additionalActionOnDecryptError
    }: Args) => {
      try {
        if (!activeWallet?.address || !activeWallet.encryptedWif) {
          throw new Error('Wallet not found');
        }

        CryptoApi.decryptWif(activeWallet.encryptedWif, password);
        await removeWallet(activeWallet.address);
        navigate(WalletRoutesEnum.root);
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
