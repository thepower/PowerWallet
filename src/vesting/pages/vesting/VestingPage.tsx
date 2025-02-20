import React from 'react';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import { useTranslation } from 'react-i18next';

import { FullScreenLoader, PageTemplate } from 'common';
import { VestingCard } from 'vesting/components/VestingCard/VestingCard';
import { useUserVestings } from 'vesting/hooks/useUserVestings';
import styles from './VestingPage.module.scss';

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

export const VestingPage: React.FC = () => {
  const { t } = useTranslation();

  const { userVestings, isLoading } = useUserVestings();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <PageTemplate
      topBarChild={t('vesting')}
      backUrl='/'
      backUrlText={t('home')!}
    >
      <div className={styles.container}>
        {userVestings && userVestings.length > 0 ? (
          <div className={styles.vestingGrid}>
            {userVestings.map((vesting) => (
              <VestingCard key={vesting.tokenId} vesting={vesting} />
            ))}
          </div>
        ) : (
          <div className={styles.noVestings}>
            <h3>{t('noVestingsTitle')}</h3>
            <p>{t('noVestingsDescription')}</p>
          </div>
        )}
      </div>
    </PageTemplate>
  );
};
