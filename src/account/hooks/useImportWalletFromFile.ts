import { useMutation } from '@tanstack/react-query';

import { CryptoApi, WalletApi } from '@thepowereco/tssdk';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { WalletRoutesEnum } from 'application/typings/routes';
import { FileReaderType, getFileData } from 'common';
import i18n from 'locales/initTranslation';
import { AddActionOnDecryptErrorType } from 'typings/common';
import { useAccountLoginToWallet } from './useAccountLoginToWallet';

type Args = {
  accountFile: File;
  password: string;
};

export const useImportWalletFromFile = () => {
  const { loginMutation } = useAccountLoginToWallet({ throwOnError: true });
  const navigate = useNavigate();

  const { mutate: importWalletFromFileMutation, isPending } = useMutation<
    void,
    Error,
    AddActionOnDecryptErrorType<Args>
  >({
    mutationFn: async ({
      accountFile,
      password,
      additionalActionOnDecryptError
    }) => {
      try {
        const data = await getFileData(accountFile, FileReaderType.binary);
        const walletData = WalletApi.parseExportData(data!, password);
        const encryptedWif = CryptoApi.encryptWif(walletData.wif!, password);

        await loginMutation({ address: walletData.address, encryptedWif });
        navigate(WalletRoutesEnum.root);
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
    isLoading: isPending
  };
};