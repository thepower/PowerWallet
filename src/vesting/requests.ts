import { NetworkApi, EvmContract, AddressApi } from '@thepowereco/tssdk';
import { Address, formatUnits } from 'viem';
import abis from 'abis';
import appEnvs from 'appEnvs';
import { queryClient } from 'application/components/App';
import { appQueryKeys } from 'application/queryKeys';
import { Wallet } from 'application/utils/localStorageUtils';

export const fetchTokenDetails = (
  networkApi: NetworkApi,
  payoutToken: Address
) =>
  queryClient.fetchQuery({
    queryKey: appQueryKeys.tokenDetails(payoutToken),
    queryFn: async () => {
      if (!networkApi) {
        throw new Error('Network API is not ready');
      }

      const tokenContract = new EvmContract(networkApi, payoutToken);

      const decimals = await tokenContract.scGet({
        abi: abis.erc20.abi,
        functionName: 'decimals',
        args: []
      });
      const symbol = await tokenContract.scGet({
        abi: abis.erc20.abi,
        functionName: 'symbol',
        args: []
      });

      const details = { decimals, symbol };
      return details;
    },
    staleTime: 4 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000
  });

export const fetchUserVesting = (
  networkApi: NetworkApi,
  activeWallet: Wallet,
  id: bigint
) =>
  queryClient.fetchQuery({
    queryKey: appQueryKeys.userVesting(activeWallet?.address, id.toString()),
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

      const walletAddress = AddressApi.textAddressToEvmAddress(
        activeWallet.address
      );

      const tokenId = await contract.scGet({
        abi: abis.linearVestingNFT.abi,
        functionName: 'tokenOfOwnerByIndex',
        args: [walletAddress, id]
      });

      const details = await contract.scGet({
        abi: abis.linearVestingNFT.abi,
        functionName: 'vestDetails',
        args: [tokenId]
      });

      const claimable = await contract.scGet({
        abi: abis.linearVestingNFT.abi,
        functionName: 'claimablePayout',
        args: [tokenId]
      });

      const claimedPayout = await contract.scGet({
        abi: abis.linearVestingNFT.abi,
        functionName: 'claimedPayout',
        args: [tokenId]
      });

      const vestedPayoutAtTime = await contract.scGet({
        abi: abis.linearVestingNFT.abi,
        functionName: 'vestedPayoutAtTime',
        args: [tokenId, BigInt((Date.now() / 1000).toFixed(0))]
      });

      const [payoutToken, payout, startTime, endTime, cliff] = details;
      const { decimals, symbol } = await fetchTokenDetails(
        networkApi,
        payoutToken
      );
      const formattedPayout = formatUnits(payout, decimals);
      const formattedClaimable = formatUnits(claimable, decimals);
      const formattedClaimed = formatUnits(claimedPayout, decimals);
      const formattedVestedPayoutAtTime = formatUnits(
        vestedPayoutAtTime,
        decimals
      );

      return {
        tokenId: tokenId.toString(),
        payoutToken,
        payout,
        startTime: Number(startTime),
        endTime: Number(endTime),
        cliff: Number(cliff),
        decimals,
        symbol,
        formattedPayout,
        claimableAmount: formattedClaimable,
        claimedPayout: formattedClaimed,
        vestedPayoutAtTime: formattedVestedPayoutAtTime
      };
    },
    staleTime: 2 * 60 * 60 * 1000, // 2 часа для вестинга
    gcTime: 24 * 60 * 60 * 1000
  });

export const fetchVestingDetails = (
  networkApi: NetworkApi,
  activeWallet: Wallet,
  id: bigint
) =>
  queryClient.fetchQuery({
    queryKey: appQueryKeys.vestingDetails(activeWallet?.address, id.toString()),
    queryFn: async () => {
      if (!networkApi) {
        throw new Error('Network API is not ready');
      }

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
        const details = await contract.scGet({
          abi: abis.linearVestingNFT.abi,
          functionName: 'vestDetails',
          args: [BigInt(id)]
        });

        const [payoutToken, payout, startTime, endTime, cliff] = details;
        const { decimals, symbol } = await fetchTokenDetails(
          networkApi,
          payoutToken
        );
        const formattedPayout = formatUnits(payout, decimals);

        return {
          payoutToken,
          payout,
          startTime: Number(startTime),
          endTime: Number(endTime),
          cliff: Number(cliff),
          decimals,
          symbol,
          formattedPayout
        };
      } catch (error) {
        console.error('Error fetching vesting details:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000
  });
