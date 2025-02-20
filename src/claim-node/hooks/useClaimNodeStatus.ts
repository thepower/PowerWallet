import { useQuery } from '@tanstack/react-query';
import { EvmContract, AddressApi } from '@thepowereco/tssdk';
import abis from 'abis';
import appEnvs from 'appEnvs';
import { useNetworkApi } from 'application/hooks';
import { appQueryKeys } from 'application/queryKeys';
import { useWalletsStore } from 'application/utils/localStorageUtils';

export const useClaimNodeStatus = () => {
  const { activeWallet } = useWalletsStore();
  const { networkApi } = useNetworkApi({
    chainId: activeWallet?.chainId
  });

  return useQuery({
    queryKey: appQueryKeys.claimNodeStatus(activeWallet?.address || ''),

    queryFn: async () => {
      if (!networkApi || !activeWallet?.address) {
        return {
          isEligible: false,
          eligibleAmount: 0,
          isAvailable: false,
          claimedAmount: 0
        };
      }
      try {
        const contract = new EvmContract(
          networkApi,
          appEnvs.CLAIM_NODE_CONTRACT_ADDRESS
        );

        const [isEligible, eligibleAmount, isAvailable, claimedAmount] =
          await Promise.all([
            contract.scGet({
              abi: abis.claimNode.abi,
              functionName: 'eligible',
              args: [AddressApi.textAddressToEvmAddress(activeWallet.address)]
            }),
            contract.scGet({
              abi: abis.claimNode.abi,
              functionName: 'eligibleAmount',
              args: [AddressApi.textAddressToEvmAddress(activeWallet.address)]
            }),
            contract.scGet({
              abi: abis.claimNode.abi,
              functionName: 'available'
            }),
            contract.scGet({
              abi: abis.claimNode.abi,
              functionName: 'claimedAmount',
              args: [AddressApi.textAddressToEvmAddress(activeWallet.address)]
            })
          ]);
        return {
          isEligible: Boolean(isEligible),
          eligibleAmount: Number(eligibleAmount || 0),
          isAvailable: Boolean(isAvailable),
          claimedAmount: Number(claimedAmount || 0)
        };
      } catch (error) {
        return {
          isEligible: false,
          eligibleAmount: 0,
          isAvailable: false,
          claimedAmount: 0
        };
      }
    },
    enabled: !!networkApi && !!activeWallet?.address,
    retry: false
  });
};
