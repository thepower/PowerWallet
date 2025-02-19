import { useReadContracts } from 'wagmi';
import abis from 'abis';
import { TokenData } from 'buy/types';

export const useTokenData = (
  tokenAddress: `0x${string}` | undefined,
  userAddress: `0x${string}` | undefined,
  swapAddress: `0x${string}` | undefined,
  enabled: boolean
): TokenData => {
  const { data, refetch } = useReadContracts({
    contracts: [
      {
        address: tokenAddress,
        abi: abis.erc20.abi,
        functionName: 'decimals'
      },
      {
        address: tokenAddress,
        abi: abis.erc20.abi,
        functionName: 'symbol'
      },
      {
        address: tokenAddress,
        abi: abis.erc20.abi,
        functionName: 'balanceOf',
        args: [userAddress!]
      },
      {
        address: tokenAddress,
        abi: abis.erc20.abi,
        functionName: 'allowance',
        args: [userAddress!, swapAddress!]
      }
    ],
    query: { enabled }
  });

  return {
    decimals: data?.[0].result as number,
    symbol: data?.[1].result as string,
    balance: data?.[2].result as bigint,
    allowance: data?.[3].result as bigint,
    refetch
  };
};
