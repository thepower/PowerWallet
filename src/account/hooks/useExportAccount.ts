import { useMutation } from '@tanstack/react-query';

import { CryptoApi, WalletApi } from '@thepowereco/tssdk';
import fileSaver from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useStore } from 'application/store';
import { WalletRoutesEnum } from 'application/typings/routes';
import { useWalletsStore } from 'application/utils/localStorageUtils';
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
  const { activeWallet } = useWalletsStore();

  const { selectedChain } = useStore();
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
    try {
      if (!activeWallet) {
        throw new Error('Wallet not found');
      }
      const address = activeWallet.address;

      const decryptedWif: string = CryptoApi.decryptWif(
        activeWallet.encryptedWif,
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
