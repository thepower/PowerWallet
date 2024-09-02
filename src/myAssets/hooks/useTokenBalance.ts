import { BigNumber, formatFixed } from '@ethersproject/bignumber';
import { useQuery } from '@tanstack/react-query';
import { AddressApi } from '@thepowereco/tssdk';
import abis from 'abis';
import { useWallets } from 'application/utils/localStorageUtils';
import { TokenKind } from 'myAssets/types';
import { useNetworkApi } from '../../application/hooks/useNetworkApi';

export const useTokenBalance = ({
  tokenAddress,
  type
}: {
  tokenAddress?: string;
  type?: TokenKind;
}) => {
  const { activeWallet } = useWallets();
  const { networkApi } = useNetworkApi({ chainId: activeWallet?.chainId });
  const getTokenBalance = async () => {
    if (!tokenAddress) {
      throw new Error('Token address not found');
    }

    if (!networkApi) {
      throw new Error('Network API not available');
    }

    if (!activeWallet) {
      throw new Error('Wallet not found');
    }

    if (type === TokenKind.Erc721) {
      const balanceBigint: bigint = await networkApi.executeCall(
        {
          abi: abis.erc721.abi,
          functionName: 'balanceOf',
          args: [AddressApi.textAddressToEvmAddress(activeWallet.address)]
        },
        { address: tokenAddress }
      );

      const balance = balanceBigint.toString();

      return balance;
    } else if (type === TokenKind.Erc20) {
      const balanceBigint: bigint = await networkApi.executeCall(
        {
          abi: abis.erc20.abi,
          functionName: 'balanceOf',
          args: [AddressApi.textAddressToEvmAddress(activeWallet.address)]
        },
        {
          address: tokenAddress
        }
      );

      const balance = balanceBigint.toString();
      const decimalsNumber = await networkApi.executeCall(
        {
          abi: abis.erc20.abi,
          functionName: 'decimals',
          args: []
        },
        {
          address: tokenAddress
        }
      );

      const decimals = decimalsNumber.toString();

      return formatFixed(BigNumber.from(balance), decimals);
    }
  };

  const {
    data: tokenBalance,
    isLoading,
    isSuccess
  } = useQuery({
    queryKey: ['tokenBalance', activeWallet?.address],
    queryFn: getTokenBalance,

    enabled:
      !!activeWallet?.address &&
      !!networkApi &&
      !!tokenAddress &&
      (type === TokenKind.Erc721 || type === TokenKind.Erc20)
  });

  return {
    tokenBalance,
    isLoading,
    isSuccess
  };
};
