import { useQuery } from '@tanstack/react-query';
import { EvmContract, AddressApi } from '@thepowereco/tssdk';
import abis from 'abis';
import appEnvs from 'appEnvs';
import { useNetworkApi } from 'application/hooks';
import { appQueryKeys } from 'application/queryKeys';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { fetchUserVesting } from 'vesting/requests';

export interface VestDetails {
  payoutToken: string;
  payout: bigint;
  startTime: number;
  endTime: number;
  cliff: number;
  tokenId: string;
  decimals?: number;
  symbol?: string;
  formattedPayout?: string;
  claimableAmount?: string;
  claimedPayout?: string;
  vestedPayoutAtTime?: string;
}

export const useUserVestings = () => {
  const { activeWallet } = useWalletsStore();

  const { networkApi } = useNetworkApi({
    chainId: activeWallet?.chainId
  });

  const {
    data: userVestings,
    error,
    isLoading
  } = useQuery({
    queryKey: appQueryKeys.userVestings(activeWallet?.address),
    queryFn: async () => {
      if (!networkApi) {
        throw new Error('Network API is not ready');
      }

      if (!activeWallet) {
        throw new Error('Wallet not found');
      }

      const contract = new EvmContract(
        networkApi,
        appEnvs.VESTING_CONTRACT_ADDRESS
      );

      try {
        const walletAddress = AddressApi.textAddressToEvmAddress(
          activeWallet.address
        );

        const balanceOf = await contract.scGet({
          abi: abis.linearVestingNFT.abi,
          functionName: 'balanceOf',
          args: [walletAddress]
        });

        const vestings: VestDetails[] = [];

        for (let i = 0n; i < balanceOf; i++) {
          const vesting = await fetchUserVesting(networkApi, activeWallet, i);
          vestings.push(vesting);
        }

        return vestings;
      } catch (error) {
        console.error('Error fetching user vestings:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    enabled: !!activeWallet && !!networkApi,
    retry: false
  });

  return {
    userVestings,
    isLoading,
    error
  };
};
