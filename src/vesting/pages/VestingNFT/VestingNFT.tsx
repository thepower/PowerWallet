import React, { useCallback, useEffect, useState } from 'react';
import { CryptoApi } from '@thepowereco/tssdk';
import {
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { formatUnits } from 'viem/utils';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { Button, PageTemplate } from 'common';
import ConfirmModal from 'common/confirmModal/ConfirmModal';
import styles from './VestingNFT.module.scss';
import { useVestingContract } from '../../hooks/useVestingContract';
import type { VestDetails } from '../../hooks/useVestingContract';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type ChartPoint = {
  x: number;
  y: number;
};

export const VestingNFTPage: React.FC = () => {
  const { t } = useTranslation();
  const { activeWallet } = useWalletsStore();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const {
    userVestings,
    fetchUserVestings,
    claimTokensMutation,
    isClaimPending,
    chartOptions
  } = useVestingContract();

  useEffect(() => {
    fetchUserVestings();
  }, []);

  const handleClaim = useCallback(
    (tokenId: string) => {
      try {
        if (!activeWallet) {
          throw new Error('Wallet not found');
        }
        const decryptedWif = CryptoApi.decryptWif(
          activeWallet.encryptedWif,
          ''
        );
        claimTokensMutation({
          wif: decryptedWif,
          tokenId
        });
      } catch (err) {
        console.error({ err });
        setSelectedTokenId(tokenId);
        setIsConfirmModalOpen(true);
      }
    },
    [activeWallet, claimTokensMutation]
  );

  const handleConfirm = useCallback(
    async (decryptedWif: string) => {
      if (!selectedTokenId) return;
      try {
        await claimTokensMutation({
          wif: decryptedWif,
          tokenId: selectedTokenId
        });
        setIsConfirmModalOpen(false);
        await fetchUserVestings();
      } catch (error) {
        console.error('Error confirming claim:', error);
      }
    },
    [claimTokensMutation, selectedTokenId, fetchUserVestings]
  );

  const getVestingChartData = useCallback(
    (vesting: VestDetails): ChartData<'line', ChartPoint[], string> => {
      if (!vesting)
        return {
          labels: [],
          datasets: [
            {
              label: t('vestedAmount'),
              data: [],
              borderColor: '#2997ff',
              tension: 0.1
            }
          ]
        };

      const { startTime, endTime, payout, decimals = 18 } = vesting;
      const totalDuration = endTime - startTime;
      const numPoints = 50; // Увеличиваем количество точек для более плавного графика
      const dataPoints: ChartPoint[] = [];
      const currentTime = Math.floor(Date.now() / 1000);

      // Добавляем начальную точку
      dataPoints.push({
        x: new Date(startTime * 1000).getTime(),
        y: 0
      });

      // Если есть cliff период, добавляем точку конца cliff
      if (vesting.cliff > startTime) {
        dataPoints.push({
          x: new Date(vesting.cliff * 1000).getTime(),
          y: 0
        });
      }

      // Добавляем промежуточные точки
      for (let i = 1; i < numPoints; i++) {
        const timestamp = startTime + (totalDuration * i) / numPoints;
        if (timestamp <= startTime) continue;

        let vestedAmount = 0n;
        if (timestamp >= endTime) {
          vestedAmount = payout;
        } else if (timestamp <= vesting.cliff) {
          vestedAmount = 0n;
        } else {
          const timeFromStart = timestamp - Math.max(startTime, vesting.cliff);
          const vestingDuration = endTime - Math.max(startTime, vesting.cliff);
          vestedAmount =
            (payout * BigInt(timeFromStart)) / BigInt(vestingDuration);
        }

        dataPoints.push({
          x: new Date(timestamp * 1000).getTime(),
          y: Number(formatUnits(vestedAmount, decimals))
        });
      }

      // Добавляем текущую точку времени
      if (currentTime > startTime && currentTime < endTime) {
        let currentVestedAmount = 0n;
        if (currentTime <= vesting.cliff) {
          currentVestedAmount = 0n;
        } else {
          const timeFromStart =
            currentTime - Math.max(startTime, vesting.cliff);
          const vestingDuration = endTime - Math.max(startTime, vesting.cliff);
          currentVestedAmount =
            (payout * BigInt(timeFromStart)) / BigInt(vestingDuration);
        }

        dataPoints.push({
          x: new Date(currentTime * 1000).getTime(),
          y: Number(formatUnits(currentVestedAmount, decimals))
        });
      }

      // Добавляем конечную точку
      dataPoints.push({
        x: new Date(endTime * 1000).getTime(),
        y: Number(formatUnits(payout, decimals))
      });

      // Сортируем точки по времени
      dataPoints.sort((a, b) => a.x - b.x);

      return {
        labels: dataPoints.map((p) => new Date(p.x).toLocaleDateString()),
        datasets: [
          {
            label: `${t('vestedAmount')} (${vesting.symbol || ''})`,
            data: dataPoints,
            borderColor: '#2997ff',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5
          }
        ]
      };
    },
    [t]
  );
  const getTimeRemaining = useCallback(
    (endTime: number) => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = endTime - now;
      if (remaining <= 0) return t('vestingComplete');

      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      return `${days}d ${hours}h`;
    },
    [t]
  );

  const getProgress = useCallback((startTime: number, endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    if (now >= endTime) return 100;
    if (now <= startTime) return 0;
    return Number(
      (((now - startTime) / (endTime - startTime)) * 100).toFixed(2)
    );
  }, []);

  return (
    <PageTemplate
      topBarChild={t('vesting')}
      backUrl='/'
      backUrlText={t('home')!}
    >
      <div className={styles.container}>
        {userVestings.length > 0 ? (
          <div className={styles.vestingGrid}>
            {userVestings.map((vesting) => {
              const progress = getProgress(vesting.startTime, vesting.endTime);

              return (
                <div key={vesting.tokenId} className={styles.vestingCard}>
                  <h3>
                    {t('vestingNFT')} #{vesting.tokenId}
                    <span className={styles.progress}>
                      {progress}% {t('vested')}
                    </span>
                  </h3>

                  <div className={styles.info}>
                    <p>
                      <span>{t('totalAmount')}</span>
                      <span>
                        {vesting.formattedPayout} {vesting.symbol}
                      </span>
                    </p>
                    <p>
                      <span>{t('claimableAmount')}</span>
                      <span>
                        {vesting.claimableAmount} {vesting.symbol}
                      </span>
                    </p>
                    <p>
                      <span>{t('claimedAmount')}</span>
                      <span>
                        {vesting.claimedPayout} {vesting.symbol}
                      </span>
                    </p>
                    <p>
                      <span>{t('vestedPayout')}</span>
                      <span>
                        {vesting.vestedPayoutAtTime} {vesting.symbol}
                      </span>
                    </p>
                    <p>
                      <span>{t('tokenContract')}</span>
                      <span className={styles.address}>
                        {vesting.payoutToken}
                      </span>
                    </p>
                    <p>
                      <span>{t('timeRemaining')}</span>
                      <span>{getTimeRemaining(vesting.endTime)}</span>
                    </p>
                    <p>
                      <span>{t('startDate')}</span>
                      <span>
                        {new Date(
                          vesting.startTime * 1000
                        ).toLocaleDateString()}
                      </span>
                    </p>
                    <p>
                      <span>{t('endDate')}</span>
                      <span>
                        {new Date(vesting.endTime * 1000).toLocaleDateString()}
                      </span>
                    </p>
                    <p>
                      <span>{t('cliffPeriod')}</span>
                      <span>
                        {vesting.cliff > 0
                          ? new Date(vesting.cliff * 1000).toLocaleDateString()
                          : t('noCliff')}
                      </span>
                    </p>
                  </div>

                  <div className={styles.chart}>
                    <Line
                      data={getVestingChartData(vesting)}
                      options={{
                        ...chartOptions,
                        maintainAspectRatio: false,
                        plugins: {
                          ...chartOptions.plugins,
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const point = context.raw as ChartPoint;
                                return `${t(
                                  'vestedAmount'
                                )}: ${point?.y.toFixed(6)} ${vesting.symbol}`;
                              },
                              title: (tooltipItems) => {
                                return new Date(
                                  tooltipItems[0].parsed.x
                                ).toLocaleDateString();
                              }
                            }
                          }
                        },
                        scales: {
                          x: {
                            type: 'time',
                            time: {
                              unit: 'day',
                              displayFormats: {
                                day: 'MMM d, yyyy'
                              }
                            },
                            grid: {
                              display: false
                            },
                            min: new Date(vesting.startTime * 1000).getTime(),
                            max: new Date(vesting.endTime * 1000).getTime()
                          },
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: 'rgba(75, 192, 192, 0.1)'
                            },
                            ticks: {
                              precision: 6
                            }
                          }
                        }
                      }}
                    />
                  </div>

                  <Button
                    variant='contained'
                    onClick={() => handleClaim(vesting.tokenId!)}
                    disabled={
                      isClaimPending || Number(vesting?.vestedPayoutAtTime) <= 0
                    }
                    className={styles.claimButton}
                  >
                    {Number(vesting?.vestedPayoutAtTime) <= 0
                      ? t('notYetClaimable')
                      : t('claim')}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.noVestings}>
            <p>{t('noVestingsFound')}</p>
          </div>
        )}

        <ConfirmModal
          open={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          callback={handleConfirm}
        />
      </div>
    </PageTemplate>
  );
};
