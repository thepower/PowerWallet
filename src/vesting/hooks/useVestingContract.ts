import { useCallback, useMemo, useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AddressApi, EvmContract } from '@thepowereco/tssdk';
import { ChartOptions } from 'chart.js';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { formatUnits } from 'viem';
import abis from 'abis';
import appEnvs from 'appEnvs';
import { useNetworkApi } from 'application/hooks/useNetworkApi';
import { appQueryKeys } from 'application/queryKeys';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import 'chart.js/auto';

export interface VestDetails {
  payoutToken: string;
  payout: bigint;
  startTime: number;
  endTime: number;
  cliff: number;
  tokenId?: string;
  decimals?: number;
  symbol?: string;
  formattedPayout?: string;
  claimableAmount?: string;
  claimedPayout?: string;
  vestedPayoutAtTime?: string;
}

type ClaimArgs = {
  wif: string;
  tokenId: string;
};

export const useVestingContract = () => {
  const { t } = useTranslation();
  const { activeWallet } = useWalletsStore();

  const [vestingDetails, setVestingDetails] = useState<VestDetails | null>(
    null
  );
  const [userVestings, setUserVestings] = useState<VestDetails[]>([]);

  // Добавляем кеш для токенов
  const tokenDetailsCache = useRef<
    Record<string, { decimals: number; symbol: string }>
  >({});

  const { networkApi, isLoading: isNetworkApiFetching } = useNetworkApi({
    chainId: activeWallet?.chainId
  });

  const queryClient = useQueryClient();

  const contract = useMemo(() => {
    if (!networkApi || !activeWallet) return null;
    const contractAddress = appEnvs.VESTING_CONTRACT_ADDRESS;
    return new EvmContract(networkApi, contractAddress);
  }, [networkApi, activeWallet]);

  const fetchTokenDetails = useCallback(
    async (tokenContract: EvmContract, tokenAddress: string) => {
      // Проверяем кеш
      if (tokenDetailsCache.current[tokenAddress]) {
        return tokenDetailsCache.current[tokenAddress];
      }

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

      // Сохраняем в кеш
      const details = { decimals, symbol };
      tokenDetailsCache.current[tokenAddress] = details;
      return details;
    },
    []
  );

  const fetchVestingDetails = useCallback(
    async (tokenId: string) => {
      if (!contract || !activeWallet || !networkApi) return;

      try {
        const details = await contract.scGet({
          abi: abis.linearVestingNFT.abi,
          functionName: 'vestDetails',
          args: [BigInt(tokenId)]
        });

        const [payoutToken, payout, startTime, endTime, cliff] = details;
        const tokenContract = new EvmContract(networkApi, payoutToken);
        const { decimals, symbol } = await fetchTokenDetails(
          tokenContract,
          payoutToken
        );
        const formattedPayout = formatUnits(payout, decimals);

        setVestingDetails({
          payoutToken,
          payout,
          startTime: Number(startTime),
          endTime: Number(endTime),
          cliff: Number(cliff),
          decimals,
          symbol,
          formattedPayout
        });
      } catch (error) {
        console.error('Error fetching vesting details:', error);
        throw error;
      }
    },
    [contract, activeWallet, networkApi, fetchTokenDetails]
  );

  const fetchUserVestings = useCallback(async () => {
    if (!contract || !activeWallet || !networkApi) return;

    try {
      const walletAddress = AddressApi.textAddressToEvmAddress(
        activeWallet.address
      );

      const balanceOf = (await contract.scGet({
        abi: abis.linearVestingNFT.abi,
        functionName: 'balanceOf',
        args: [walletAddress]
      })) as bigint;

      const vestings: VestDetails[] = [];

      for (let i = 0n; i < balanceOf; i++) {
        const tokenId = (await contract.scGet({
          abi: abis.linearVestingNFT.abi,
          functionName: 'tokenOfOwnerByIndex',
          args: [walletAddress, i]
        })) as bigint;

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
        const tokenContract = new EvmContract(networkApi, payoutToken);
        const { decimals, symbol } = await fetchTokenDetails(
          tokenContract,
          payoutToken
        );
        const formattedPayout = formatUnits(payout, decimals);
        const formattedClaimable = formatUnits(claimable, decimals);
        const formattedClaimed = formatUnits(claimedPayout, decimals);
        const formattedVestedPayoutAtTime = formatUnits(
          vestedPayoutAtTime,
          decimals
        );

        vestings.push({
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
        });
      }

      setUserVestings(vestings);
    } catch (error) {
      console.error('Error fetching user vestings:', error);
      throw error;
    }
  }, [contract, activeWallet, networkApi, fetchTokenDetails]);

  const { mutateAsync: claimTokensMutation, isPending: isClaimPending } =
    useMutation<void, Error, ClaimArgs>({
      mutationFn: async ({ wif, tokenId }: ClaimArgs) => {
        try {
          if (!contract || !activeWallet) {
            throw new Error('Contract or wallet not available');
          }

          const response = await contract.scSet(
            {
              abi: abis.linearVestingNFT.abi,
              functionName: 'claim',
              args: [BigInt(tokenId)]
            },
            { key: { wif, address: activeWallet.address } }
          );

          if (response?.txId) {
            queryClient.invalidateQueries({
              queryKey: appQueryKeys.walletData(activeWallet.address)
            });

            await fetchVestingDetails(tokenId);

            toast.success(t('claimSuccess'));
          }
        } catch (error: any) {
          console.error('Error claiming tokens:', error);
          toast.error(`${t('claimError')} ${error}`);
        }
      }
    });

  const chartData = useMemo(() => {
    if (!vestingDetails) return null;

    const { startTime, endTime, payout } = vestingDetails;
    const totalDuration = endTime - startTime;
    const numPoints = 20;

    const dataPoints = Array.from({ length: numPoints + 1 }, (_, i) => {
      const timestamp = startTime + (totalDuration * i) / numPoints;
      const vestedAmount =
        timestamp <= startTime
          ? 0n
          : timestamp >= endTime
          ? payout
          : (payout * BigInt(timestamp - startTime)) / BigInt(totalDuration);

      return {
        x: timestamp * 1000,
        y: Number(vestedAmount)
      };
    });

    return {
      labels: dataPoints.map((p) => new Date(p.x).toLocaleDateString()),
      datasets: [
        {
          label: t('vestedAmount'),
          data: dataPoints,
          borderColor: '#2997ff',
          tension: 0.1
        }
      ]
    };
  }, [vestingDetails, t]);

  const formatDateLocale = useCallback(
    (date: Date) => {
      return format(date, 'MMM d', {
        locale: i18next.language === 'ru' ? ru : enUS
      });
    },
    [i18next.language]
  );

  const chartOptions = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'MMM d, yyyy'
            },
            tooltipFormat: 'PPP'
          },
          grid: {
            display: false
          },
          ticks: {
            source: 'data',
            autoSkip: true,
            maxTicksLimit: 6,
            callback: (value) => {
              return formatDateLocale(new Date(value));
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(75, 192, 192, 0.1)'
          },
          ticks: {
            callback: (value) => {
              if (typeof value !== 'number') return '';
              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
              if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
              return value.toFixed(2);
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        title: {
          display: true,
          text: t('vestingSchedule'),
          font: {
            size: 16,
            weight: 500
          },
          padding: {
            bottom: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 13
          },
          bodyFont: {
            size: 12
          },
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (tooltipItems) => {
              const date = new Date(tooltipItems[0].parsed.x);
              return formatDateLocale(date);
            }
          }
        }
      }
    }),
    [t, formatDateLocale]
  );

  return {
    userVestings,
    fetchUserVestings,
    claimTokensMutation,
    isClaimPending,
    isFetching: isNetworkApiFetching,
    chartData,
    chartOptions
  };
};
