import { useMutation } from '@tanstack/react-query';

// import { useStore } from '@tanstack/react-store';
import { CryptoApi, WalletApi } from '@thepowereco/tssdk';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { WalletRoutesEnum } from 'application/typings/routes';
import { FileReaderType, getFileData } from 'common';
import { useAccountLoginToWallet } from './useAccountLoginToWallet';

type Args = {
  accountFile: File;
  password: string;
};

export const useImportWalletFromFile = () => {
  const { loginMutation } = useAccountLoginToWallet({ throwOnError: true });
  const navigate = useNavigate();
  // const queryClient = useQueryClient();

  const { mutate: importWalletFromFileMutation, isPending } = useMutation<
    void,
    Error,
    Args
  >({
    mutationFn: async ({ accountFile, password }) => {
      try {
        const data = await getFileData(accountFile, FileReaderType.binary);
        const walletData = WalletApi.parseExportData(data!, password);
        const encryptedWif = CryptoApi.encryptWif(walletData.wif!, password);

        await loginMutation({ address: walletData.address, encryptedWif });
        navigate(WalletRoutesEnum.root);
      } catch (e: any) {
        // if (
        //   additionalActionOnDecryptError &&
        //   e.message === 'unable to decrypt data'
        // ) {
        //   additionalActionOnDecryptError?.();
        // } else {
        //   toast.error(i18n.t('importAccountError'));
        // }
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({
      //   queryKey: ['walletData', walletAddress]
      // });
    }
  });

  return {
    importWalletFromFileMutation,
    isLoading: isPending
  };
};
