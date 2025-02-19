import { useEffect, useState } from 'react';
import { round } from 'lodash';
import { formatUnits, parseUnits } from 'viem/utils';
import { useReadContract } from 'wagmi';
import abis from 'abis';

interface UseTokenPriceParams {
  swapAddress: `0x${string}`;
  tokenPayDecimals: number;
  promoCodeKeccak256: `0x${string}`;
  targetTime: bigint;
  isEnableOrWatched: boolean;
  isBridge: boolean;
}

export const useTokenPrice = ({
  swapAddress,
  tokenPayDecimals,
  promoCodeKeccak256,
  targetTime,
  isEnableOrWatched,
  isBridge
}: UseTokenPriceParams) => {
  const [tokenPrice, setTokenPrice] = useState<number | null>(null);

  const {
    data: calc,
    isLoading,
    error
  } = useReadContract({
    address: swapAddress,
    abi: abis.swapEVM.abi,
    functionName: 'calc',
    args: [parseUnits('1', tokenPayDecimals), promoCodeKeccak256, targetTime],
    query: {
      enabled: isEnableOrWatched && !isBridge
    }
  });

  useEffect(() => {
    if (calc && calc.length === 2 && tokenPayDecimals != null) {
      try {
        const amountPay = formatUnits(calc[0], tokenPayDecimals);
        const amountBuy = formatUnits(calc[1], tokenPayDecimals);
        const newPrice = round(Number(amountPay) / Number(amountBuy), 6);
        setTokenPrice(newPrice);
      } catch (error) {
        console.error('Ошибка при вычислении tokenPrice:', error);
      }
    }
  }, [calc, tokenPayDecimals]);

  return { tokenPrice, isLoading, error };
};
