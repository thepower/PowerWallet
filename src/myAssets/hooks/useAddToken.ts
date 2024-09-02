import { useMutation } from '@tanstack/react-query';
import { NetworkApi } from '@thepowereco/tssdk';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import abis from 'abis';

import { WalletRoutesEnum } from 'application/typings/routes';
import { useTokens, useWallets } from 'application/utils/localStorageUtils';
import i18n from 'locales/initTranslation';
import { TokenKind } from 'myAssets/types';
import { useNetworkApi } from '../../application/hooks/useNetworkApi';

type Args = { address: string; withoutRedirect?: boolean };

export const useAddToken = ({ throwOnError }: { throwOnError?: boolean }) => {
  const { activeWallet } = useWallets();
  const { networkApi, isLoading: isNetworkApiFetching } = useNetworkApi({
    chainId: activeWallet?.chainId
  });
  const navigate = useNavigate();
  const { addToken, tokens } = useTokens();
  const getIsErc721 = async (network: NetworkApi, address: string) => {
    try {
      const isErc721: boolean = await network.executeCall(
        {
          abi: abis.erc721.abi,
          functionName: 'supportsInterface',
          args: ['0x80ac58cd']
        },
        { address }
      );

      return isErc721;
    } catch {
      return false;
    }
  };

  const fetchAndAddToken = async ({ address, withoutRedirect }: Args) => {
    if (!networkApi) {
      throw new Error('Network API is not ready');
    }

    if (!activeWallet) {
      throw new Error('Wallet not found');
    }
    try {
      const existedToken = tokens.find((token) => token.address === address);

      if (existedToken && existedToken?.chainId) {
        toast.error(i18n.t('tokenHasAlreadyBeenAdded'));
        return;
      }

      const contractNetworkApi = networkApi;
      const { chain }: { chain?: number } =
        await networkApi.getAddressChain(address);

      if (!chain) {
        toast.error(i18n.t('addressNotFound'));
      }

      if (chain !== networkApi.getChain()) {
        toast.error(i18n.t('wrongChain'));
      }

      const isErc721 = await getIsErc721(contractNetworkApi, address);

      if (isErc721) {
        const name: string = await contractNetworkApi.executeCall(
          {
            abi: abis.erc721.abi,
            functionName: 'name',
            args: []
          },
          {
            address
          }
        );
        const symbol: string = await contractNetworkApi.executeCall(
          {
            abi: abis.erc721.abi,
            functionName: 'symbol',
            args: []
          },
          {
            address
          }
        );

        addToken({
          name,
          symbol,
          address,
          decimals: '1',
          type: TokenKind.Erc721,
          chainId: chain!,
          isShow: true
        });
      } else {
        const name: string = await contractNetworkApi.executeCall(
          {
            abi: abis.erc20.abi,
            functionName: 'name',
            args: []
          },
          {
            address
          }
        );

        const symbol: string = await contractNetworkApi.executeCall(
          {
            abi: abis.erc20.abi,
            functionName: 'symbol',
            args: []
          },
          {
            address
          }
        );

        const decimalsNumber = await contractNetworkApi.executeCall(
          {
            abi: abis.erc20.abi,
            functionName: 'decimals',
            args: []
          },
          {
            address
          }
        );

        const decimals = decimalsNumber.toString();

        addToken({
          name,
          symbol,
          address,
          decimals,
          chainId: chain!,
          type: TokenKind.Erc20,
          isShow: true
        });
      }
      if (!withoutRedirect) navigate(WalletRoutesEnum.root);
    } catch (error: any) {
      toast.error(`${i18n.t('somethingWentWrongCode')} ${error?.code}`);
    }
  };

  const { mutateAsync: addTokenMutation, isPending } = useMutation<
    void,
    Error,
    Args
  >({
    mutationFn: fetchAndAddToken,
    onSuccess: async () => {},
    onError: (e) => {
      console.error('loginToWalletSaga', e);

      toast.error(i18n.t(`loginError${e}`));
    },
    throwOnError
  });
  return { addTokenMutation, isPending, isFetching: isNetworkApiFetching };
};
