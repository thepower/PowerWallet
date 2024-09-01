import { useMutation } from '@tanstack/react-query';

import { useStore } from '@tanstack/react-store';
import { CryptoApi, WalletApi } from '@thepowereco/tssdk';
import fileSaver from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { store } from 'application/store';
import { WalletRoutesEnum } from 'application/typings/routes';
import { useWallets } from 'application/utils/localStorageUtils';
import i18n from 'locales/initTranslation';
import {
  AddActionOnSuccessType,
  AddActionOnDecryptErrorType
} from 'typings/common';

type Args = AddActionOnDecryptErrorType<
  AddActionOnSuccessType<{
    password: string;
    hint?: string;
    isWithoutGoHome?: boolean;
  }>
>;

export const useExportAccount = () => {
  const { activeWallet } = useWallets();
  const { selectedChain } = useStore(store);
  const navigate = useNavigate();

  const exportAccount = async ({
    hint,
    password,
    isWithoutGoHome,
    additionalActionOnSuccess,
    additionalActionOnDecryptError
  }: Args) => {
    const currentNetworkChain = activeWallet?.chainId;
    const currentRegistrationChain = selectedChain;
    const address = activeWallet!.address;
    try {
      const decryptedWif: string = CryptoApi.decryptWif(
        activeWallet!.encryptedWif,
        password
      );
      const exportedData: string = WalletApi.getExportData(
        decryptedWif,
        address,
        password,
        hint
      );

      const blob: Blob = new Blob([exportedData], {
        type: 'octet-stream'
      });

      const fileName =
        currentNetworkChain || currentRegistrationChain
          ? `power_wallet_${
              currentRegistrationChain || currentNetworkChain
            }_${address}.pem`
          : `power_wallet_${address}.pem`;

      fileSaver.saveAs(blob, fileName, { autoBom: true });

      if (!isWithoutGoHome) {
        navigate(WalletRoutesEnum.root);
      }

      additionalActionOnSuccess?.();
    } catch (e: any) {
      console.error('exportAccountSaga', e);

      if (
        additionalActionOnDecryptError &&
        e.message === 'unable to decrypt data'
      ) {
        additionalActionOnDecryptError?.();
      } else {
        toast.error(i18n.t('exportAccountError'));
      }
    }
  };

  const { mutate: exportAccountMutation, isPending } = useMutation<
    void,
    Error,
    Args
  >({
    mutationFn: exportAccount,
    onError: (error) => {
      toast.error(error.message);
    }
  });

  return {
    exportAccountMutation,
    isLoading: isPending
  };
};
