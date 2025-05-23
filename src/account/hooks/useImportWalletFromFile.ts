import { useMutation } from '@tanstack/react-query';

import { CryptoApi, WalletApi } from '@thepowereco/tssdk';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { RoutesEnum } from 'application/typings/routes';
import { FileReaderType, getFileData } from 'common';
import i18n from 'locales/initTranslation';
import { AddActionOnSuccessAndDecryptType } from 'typings/common';
import { useAccountLoginToWallet } from './useAccountLoginToWallet';

type Args = {
  accountFile: File;
  password: string;
  isWithoutGoHome?: boolean;
};

export const useImportWalletFromFile = () => {
  const { loginMutation } = useAccountLoginToWallet({ throwOnError: true });
  const navigate = useNavigate();

  const { mutate: importWalletFromFileMutation, isPending } = useMutation<
    void,
    Error,
    AddActionOnSuccessAndDecryptType<
      Args,
      { address?: string; chainId?: number }
    >
  >({
    mutationFn: async ({
      accountFile,
      password,
      additionalActionOnSuccess,
      additionalActionOnDecryptError,
      isWithoutGoHome
    }) => {
      try {
        const data = await getFileData(accountFile, FileReaderType.binary);
        const walletData = WalletApi.parseExportData(data!, password);

        if (!walletData) {
          throw new Error('unable to decrypt data');
        }

        const encryptedWif = CryptoApi.encryptWif(walletData.wif, password);

        const loginResult = await loginMutation({
          address: walletData?.address,
          encryptedWif
        });

        additionalActionOnSuccess?.({
          address: walletData?.address,
          chainId: loginResult?.chainId
        });

        !isWithoutGoHome && navigate(RoutesEnum.root);
      } catch (e: any) {
        if (
          additionalActionOnDecryptError &&
          e.message === 'unable to decrypt data'
        ) {
          additionalActionOnDecryptError?.();
        } else {
          toast.error(i18n.t('importAccountError'));
        }
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  return {
    importWalletFromFileMutation,
    isPending
  };
};
