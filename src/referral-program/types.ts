import { TFunction } from 'i18next';

export enum ReferralProgramTabs {
  referralLink = 'referralLink',
  rewards = 'rewards',
}
export const getReferralProgramTabsLabels = (t: TFunction) => ({
  referralLink: t('referralLink'),
  rewards: t('rewards'),
} as const);
