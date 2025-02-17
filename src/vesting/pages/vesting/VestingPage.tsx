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

import { PageTemplate } from 'common';
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

  const renderSkeletons = () => {
    return Array(1)
      .fill(null)
      .map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className={`${styles.vestingCard} ${styles.skeleton}`}
        >
          <div className={styles.skeletonHeader}>
            <div className={styles.skeletonTitle}></div>
            <div className={styles.skeletonProgress}></div>
          </div>
          <div className={styles.info}>
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <p key={i}>
                  <span className={styles.skeletonText}></span>
                  <span className={styles.skeletonValue}></span>
                </p>
              ))}
          </div>
          <div className={`${styles.chart} ${styles.skeletonChart}`}></div>
          <div className={styles.skeletonButton}></div>
        </div>
      ));
  };

  return (
    <PageTemplate
      topBarChild={t('vesting')}
      backUrl='/'
      backUrlText={t('home')!}
    >
      <div className={styles.container}>
        {isLoading ? (
          <div className={styles.vestingGrid}>{renderSkeletons()}</div>
        ) : (
          <div className={styles.vestingGrid}>
            {userVestings &&
              userVestings.map((vesting) => (
                <VestingCard key={vesting.tokenId} vesting={vesting} />
              ))}
          </div>
        )}
      </div>
    </PageTemplate>
  );
};
