import { TFunction } from 'i18next';

export enum ReferralSystemTabs {
  referralLink = 'referralLink',
  rewards = 'rewards',
}
export const getReferralSystemTabsLabels = (t: TFunction) => ({
  referralLink: t('referralLink'),
  rewards: t('rewards'),
} as const);
