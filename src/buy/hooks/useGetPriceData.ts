import { useQuery } from '@tanstack/react-query';
import { readContracts } from '@wagmi/core';
import { formatEther } from 'viem';
import { useConfig } from 'wagmi';
import abis from 'abis';

import { appQueryKeys } from 'application/queryKeys';
import { TimeSeriesData } from 'buy/components/LineChart';

export const useGetPriceData = ({
  promoCodeKeccak256,
  swapAddress
}: {
  promoCodeKeccak256?: `0x${string}`;
  swapAddress?: `0x${string}`;
}) => {
  const config = useConfig();
  const {
    data: priceData,
    isLoading,
    isSuccess,
    refetch
  } = useQuery<{
    data: TimeSeriesData[];
    offerAvailable: number;
    availableAllocation: string;
  }>({
    queryKey: appQueryKeys.priceData(promoCodeKeccak256),

    queryFn: async () => {
      const currentTimestamp = Math.floor(Date.now() / 1000);

      const data = await readContracts(config, {
        contracts: [
          {
            address: swapAddress!,
            abi: abis.swapEVM.abi,
            functionName: 'getDiscount',
            args: [promoCodeKeccak256!]
          },
          {
            address: swapAddress!,
            abi: abis.swapEVM.abi,
            functionName: 'denominator',
            args: []
          },
          {
            address: swapAddress!,
            abi: abis.swapEVM.abi,
            functionName: 'numerator',
            args: []
          }
        ]
      });

      const discountData = data[0].result;
      const denominator = data[1].result;
      const numerator = data[2].result;

      if (!(discountData && denominator && numerator)) {
        return {
          offerAvailable: 0,
          availableAllocation: '0',
          data: []
        };
      }

      const offerAvailable =
        Number(discountData[2]) -
        ((currentTimestamp - Number(discountData[0])) %
          Number(discountData[2]));

      const availableAllocation = formatEther(discountData[4]);

      const toGo = Number(discountData[1]) - currentTimestamp;
      const pcsLeft = Math.ceil(toGo / Number(discountData[2]));

      const priceData: TimeSeriesData[] = [];
      if (
        currentTimestamp > discountData[0] &&
        currentTimestamp < discountData[1]
      ) {
        let t = discountData[1] - BigInt(pcsLeft) * discountData[2];

        for (; t <= discountData[1]; t += discountData[2]) {
          const discount1 =
            ((discountData[1] - BigInt(t)) / discountData[2]) * discountData[3];
          priceData.push([
            Number(t),
            Number(denominator) / Number(numerator + discount1)
          ]);
          const discount2 =
            ((discountData[1] - BigInt(t + 1n)) / discountData[2]) *
            discountData[3];
          priceData.push([
            Number(t + 1n),
            Number(denominator) / Number(numerator + discount2)
          ]);
        }
      } else {
        priceData.push([
          currentTimestamp,
          Number(denominator) / Number(numerator)
        ]);
        priceData.push([
          currentTimestamp + 86400,
          Number(denominator) / Number(numerator)
        ]);
        priceData.push([
          currentTimestamp + 86400 * 2,
          Number(denominator) / Number(numerator)
        ]);
      }

      return {
        offerAvailable,
        availableAllocation,
        data: priceData
      };
    },
    enabled: Boolean(promoCodeKeccak256 && swapAddress)
  });

  return {
    priceData,
    isLoading,
    isSuccess,
    refetch
  };
};
