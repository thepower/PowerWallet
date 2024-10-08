import { useMutation } from '@tanstack/react-query';

import { CryptoApi, RegisteredAccount, WalletApi } from '@thepowereco/tssdk';
import { toast } from 'react-toastify';

import { useStore } from 'application/store';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import i18n from 'locales/initTranslation';
import { BackupAccountStepsEnum } from 'registration/typings/registrationTypes';
import { AddActionOnSuccessType } from 'typings/common';

type Args = AddActionOnSuccessType<
  {
    password: string;
    seedPhrase: string;
    referrer?: string;
  },
  string
>;

type ReturnParams = {
  chainId: number;
  address: string;
  encryptedWif: string;
};

export const useCreateWallet = () => {
  const {
    isRandomChain,
    selectedNetwork,
    selectedChain,
    setSelectedChain,
    setBackupStep
  } = useStore();
  const { addWallet, wallets } = useWalletsStore();

  const { mutate: createWalletMutation, isPending } = useMutation<
    ReturnParams | undefined,
    Error,
    Args
  >({
    mutationFn: async ({
      password,
      seedPhrase,
      referrer,
      additionalActionOnSuccess
    }) => {
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

      additionalActionOnSuccess?.(password);

      return {
        chainId: account.chain,
        address: account.address,
        encryptedWif
      };
    },

    onSuccess: (params) => {
      if (params) {
        addWallet({
          name: 'wallet ' + (wallets.length + 1),
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
