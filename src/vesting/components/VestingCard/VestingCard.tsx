import { FC, useCallback, useMemo } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { CryptoApi } from '@thepowereco/tssdk';
import { ChartData } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { formatUnits } from 'viem';
import appEnvs from 'appEnvs';
import { useConfirmModalPromise } from 'application/hooks';
import {
  useTokensStore,
  useWalletsStore
} from 'application/utils/localStorageUtils';
import { Button } from 'common';
import { TokenKind } from 'myAssets/types';
import { useChartOptions, useClaimTokens, VestDetails } from 'vesting/hooks';
import styles from './VestingCard.module.scss';

type ChartPoint = {
  x: number;
  y: number;
};

type Props = {
  vesting: VestDetails;
};

export const VestingCard: FC<Props> = ({ vesting }) => {
  const { t } = useTranslation();
  const { chartOptions } = useChartOptions();
  const { confirm } = useConfirmModalPromise();
  const { activeWallet } = useWalletsStore();
  const { claimTokens, isClaimPending } = useClaimTokens();
  const { addToken, isAddressUnique } = useTokensStore();

  const newToken = useMemo(
    () => ({
      name: vesting?.symbol || '',
      symbol: vesting?.symbol || '',
      address: vesting?.payoutToken,
      decimals: vesting?.decimals || 18,
      chainId: activeWallet?.chainId || null,
      type: TokenKind.Erc20,
      isShow: true
    }),
    [
      vesting?.symbol,
      vesting?.payoutToken,
      vesting?.decimals,
      activeWallet?.chainId
    ]
  );

  const isTokenAdded = useMemo(
    () => isAddressUnique(newToken),
    [isAddressUnique, newToken]
  );

  const handleAddToken = useCallback(async () => {
    if (!vesting.payoutToken) return;

    if (activeWallet?.chainId) {
      if (isAddressUnique(newToken)) {
        addToken(newToken);

        toast.done(t('tokenAdded'));
      } else {
        toast.warn(t('tokenAlreadyAdded'));
      }
    }
  }, [
    vesting.payoutToken,
    activeWallet?.chainId,
    isAddressUnique,
    newToken,
    addToken,
    t
  ]);

  const handleCopyAddress = useCallback(() => {
    navigator.clipboard.writeText(vesting.payoutToken);
    toast.success(t('copiedToClipboard'));
  }, [vesting.payoutToken, t]);

  const handleClaim = useCallback(
    async (tokenId: string) => {
      try {
        if (!activeWallet) {
          throw new Error('Wallet not found');
        }
        const decryptedWif = CryptoApi.decryptWif(
          activeWallet.encryptedWif,
          ''
        );
        await claimTokens({
          wif: decryptedWif,
          tokenId
        });
      } catch (err) {
        const decryptedWif = await confirm();
        if (decryptedWif) {
          await claimTokens({
            wif: decryptedWif,
            tokenId: vesting.tokenId
          });
        }
      }
    },
    [activeWallet, claimTokens, confirm, vesting?.tokenId]
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
      const numPoints = 20;
      const dataPoints: ChartPoint[] = [];
      const currentTime = Math.floor(Date.now() / 1000);

      dataPoints.push({
        x: new Date(startTime * 1000).getTime(),
        y: 0
      });

      if (vesting.cliff > startTime) {
        dataPoints.push({
          x: new Date(vesting.cliff * 1000).getTime(),
          y: 0
        });
      }

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

      dataPoints.push({
        x: new Date(endTime * 1000).getTime(),
        y: Number(formatUnits(payout, decimals))
      });

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

  const getProgress = useCallback((startTime: number, endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    if (now >= endTime) return 100;
    if (now <= startTime) return 0;
    return Number(
      (((now - startTime) / (endTime - startTime)) * 100).toFixed(2)
    );
  }, []);

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

  const progress = getProgress(vesting.startTime, vesting.endTime);

  return (
    <div key={vesting.tokenId} className={styles.vestingCard}>
      <h3>
        {t('vestingNFT')} #{vesting.tokenId}
        <span className={styles.progress}>
          {progress}% {t('vested')}
        </span>
      </h3>

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
                    return `${t('vestedAmount')}: ${point?.y.toFixed(6)} ${
                      vesting.symbol
                    }`;
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
          <span className={styles.addressContainer}>
            <span onClick={handleCopyAddress} className={styles.address}>
              {vesting.payoutToken}
            </span>
            <AddCircleOutlineIcon
              className={styles.addTokenIcon}
              onClick={handleAddToken}
              style={{
                opacity: isTokenAdded ? 0.5 : 1,
                cursor: isTokenAdded ? 'default' : 'pointer'
              }}
            />
          </span>
        </p>
        <p>
          <span>{t('timeRemaining')}</span>
          <span>{getTimeRemaining(vesting.endTime)}</span>
        </p>
        <p>
          <span>{t('startDate')}</span>
          <span>{new Date(vesting.startTime * 1000).toLocaleDateString()}</span>
        </p>
        <p>
          <span>{t('endDate')}</span>
          <span>{new Date(vesting.endTime * 1000).toLocaleDateString()}</span>
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

      <div className={styles.actions}>
        <Button
          variant='outlined'
          to={`/erc721/${appEnvs.VESTING_CONTRACT_ADDRESS}/${vesting.tokenId}/send`}
          className={styles.sendButton}
        >
          {t('send')}
        </Button>
        <Button
          variant='contained'
          onClick={() => handleClaim(vesting.tokenId!)}
          disabled={isClaimPending || Number(vesting?.vestedPayoutAtTime) <= 0}
          className={styles.claimButton}
          loading={isClaimPending}
        >
          {Number(vesting?.vestedPayoutAtTime) <= 0
            ? t('notYetClaimable')
            : t('claim')}
        </Button>
      </div>
    </div>
  );
};
