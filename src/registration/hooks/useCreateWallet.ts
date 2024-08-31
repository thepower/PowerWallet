import { useMutation } from '@tanstack/react-query';

import { useStore } from '@tanstack/react-store';
import { CryptoApi, RegisteredAccount, WalletApi } from '@thepowereco/tssdk';
import { toast } from 'react-toastify';
import { setBackupStep, setSelectedChain, store } from 'application/store';
import { useWallets } from 'application/utils/localStorageUtils';
import i18n from 'locales/initTranslation';
import { BackupAccountStepsEnum } from 'registration/typings/registrationTypes';

type Args = {
  password: string;
  seedPhrase: string;
  referrer?: string;
};

type ReturnParams = {
  chainId: number;
  address: string;
  encryptedWif: string;
};

export const useCreateWallet = () => {
  const { isRandomChain, selectedNetwork, selectedChain } = useStore(store);
  const { addWallet } = useWallets();

  const { mutate: createWalletMutation, isPending } = useMutation<
    ReturnParams | undefined,
    Error,
    Args
  >({
    mutationFn: async ({ password, seedPhrase, referrer }) => {
      let account: RegisteredAccount;
      if (!isRandomChain && !selectedChain) return;
      if (isRandomChain) {
        if (selectedNetwork) {
          account = await WalletApi.registerRandomChain({
            network: selectedNetwork,
            customSeed: seedPhrase!,
            referrer
          });
          setSelectedChain(account.chain);
        } else {
          return;
        }
      } else {
        account = await WalletApi.registerCertainChain({
          chain: selectedChain!,
          customSeed: seedPhrase!,
          referrer
        });
      }
      const encryptedWif = CryptoApi.encryptWif(account.wif, password);

      return {
        chainId: account.chain,
        address: account.address,
        encryptedWif
      };
    },

    onSuccess: async (params) => {
      if (params) {
        await addWallet({
          chainId: params.chainId,
          address: params.address,
          encryptedWif: params.encryptedWif
        });
        setBackupStep(BackupAccountStepsEnum.registrationCompleted);
      }
    },

    onError: (e) => {
      console.error('createWalletSaga', e);
      toast.error(i18n.t('createAccountError'));
    }
  });

  return {
    createWalletMutation,
    isLoading: isPending
  };
};
