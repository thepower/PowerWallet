import { TFunction } from 'i18next';

// i18next keys
export const getRegistrationTabs = (t: TFunction) => ({
  selectNetwork: t('selectNetwork'),
  backup: t('backup'),
  login: t('login'),
} as const);

export enum CreateAccountStepsEnum {
  selectNetwork,
  backup,
  login,
}

export enum BackupAccountStepsEnum {
  generateSeedPhrase,
  encryptPrivateKey,
  registrationCompleted,
}

export type SetSeedPhraseInput = {
  seedPhrase: string;
  nextStep: CreateAccountStepsEnum;
};

export type LoginToWalletInputType = {
  address: string;
  seedOrPrivateKey: string;
  password: string;
};
