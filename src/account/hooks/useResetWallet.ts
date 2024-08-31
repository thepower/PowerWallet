import { useCallback } from 'react';
import { CryptoApi } from '@thepowereco/tssdk';
import { useNavigate } from 'react-router-dom';
import { WalletRoutesEnum } from 'application/typings/routes';
import { useWallets } from 'application/utils/localStorageUtils';

export const useResetWallet = () => {
  const { activeWallet, removeWallet } = useWallets();
  const navigate = useNavigate();
  const resetWallet = useCallback(
    async (password: string) => {
      try {
        if (!activeWallet?.address || !activeWallet.encryptedWif) {
          throw new Error('Wallet not found');
        }

        CryptoApi.decryptWif(activeWallet.encryptedWif, password);
        await removeWallet(activeWallet.address);
        navigate(WalletRoutesEnum.root);
      } catch (error) {
        console.error(error);
      }
    },
    [activeWallet, removeWallet, navigate]
  );

  return { resetWallet };
};
