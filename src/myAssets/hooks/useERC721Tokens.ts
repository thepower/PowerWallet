import { useQuery } from '@tanstack/react-query';
import { AddressApi, NetworkApi } from '@thepowereco/tssdk';
import axios, { AxiosResponse } from 'axios';
import range from 'lodash/range';
import abis from 'abis';
import { appQueryKeys } from 'application/queryKeys';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { useNetworkApi } from '../../application/hooks/useNetworkApi';

async function checkTokenOfOwnerByIndex({
  ownerAddress,
  tokenAddress,
  networkApi
}: {
  ownerAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
  networkApi: NetworkApi;
}) {
  try {
    await networkApi.executeCall(
      {
        abi: abis.erc721.abi,
        functionName: 'tokenOfOwnerByIndex',
        args: [AddressApi.textAddressToEvmAddress(ownerAddress), BigInt(1)]
      },
      { address: tokenAddress }
    );
    return true;
  } catch (error) {
    return false;
  }
}

async function getMetaData(uri: string) {
  try {
    const res: AxiosResponse<{
      name?: string;
      description?: string;
      image?: string;
    }> = await axios.get(uri);

    return res.data;
  } catch (error) {
    return null;
  }
}

export const useERC721Tokens = ({
  tokenAddress,
  enabled
}: {
  tokenAddress?: string;
  enabled?: boolean;
}) => {
  const { activeWallet } = useWalletsStore();

  const { networkApi } = useNetworkApi({ chainId: activeWallet?.chainId });

  const getErc721Token = async (id: number) => {
    if (!networkApi) {
      throw new Error('Network API is not ready');
    }

    if (!activeWallet) {
      throw new Error('Wallet not found');
    }

    if (!tokenAddress) {
      throw new Error('Token address not found');
    }

    const tokenIdBigint = await networkApi.executeCall(
      {
        abi: abis.erc721.abi,
        functionName: 'tokenOfOwnerByIndex',
        args: [
          AddressApi.textAddressToEvmAddress(activeWallet.address),
          BigInt(id)
        ]
      },
      { address: tokenAddress }
    );

    const tokenId = tokenIdBigint.toString();

    const uri: string = await networkApi.executeCall(
      {
        abi: abis.erc721.abi,
        functionName: 'tokenURI',
        args: [tokenIdBigint]
      },
      {
        address: tokenAddress
      }
    );

    if (!uri) {
      return { id: tokenId };
    }

    const metadata = await getMetaData(uri);

    if (metadata?.image) {
      return {
        id: tokenId,
        name: metadata?.name || '',
        description: metadata?.description || '',
        image: metadata?.image || ''
      };
    }
    return { id: tokenId, image: uri };
  };

  const {
    data: erc721Tokens,
    isLoading,
    isSuccess
  } = useQuery({
    queryKey: appQueryKeys.ERC721Tokens(activeWallet?.address, tokenAddress),
    queryFn: async () => {
      if (!activeWallet?.address) {
        throw new Error('Address not found');
      }

      if (!networkApi) {
        throw new Error('Network API not available');
      }

      if (!tokenAddress) {
        throw new Error('Token address not found');
      }

      const isMethodTokenOfOwnerByIndexSupported =
        await checkTokenOfOwnerByIndex({
          ownerAddress: activeWallet.address as `0x${string}`,
          tokenAddress: tokenAddress as `0x${string}`,
          networkApi
        });

      if (!isMethodTokenOfOwnerByIndexSupported) {
        return [];
      }

      const balanceBigint = await networkApi.executeCall(
        {
          abi: abis.erc721.abi,
          functionName: 'balanceOf',
          args: [AddressApi.textAddressToEvmAddress(activeWallet.address)]
        },
        {
          address: tokenAddress!
        }
      );

      const balance = Number(balanceBigint);

      const tokens = await Promise.all(
        range(0, balance).map((id) => getErc721Token(id))
      );

      return tokens;
    },
    enabled:
      !!activeWallet?.address && !!networkApi && !!tokenAddress && !!enabled
  });

  return {
    erc721Tokens,
    isLoading,
    isSuccess
  };
};
