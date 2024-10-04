import { NetworkEnum } from '@thepowereco/tssdk';
import { create } from 'zustand';
import {
  BackupAccountStepsEnum,
  CreateAccountStepsEnum
} from 'registration/typings/registrationTypes';
import { Maybe } from 'typings/common';

export type SentData = {
  from: string;
  to: string;
  amount: number | string;
  comment: Maybe<string>;
  txId: string;
  returnURL?: string;
};

interface State {
  selectedNetwork: Maybe<NetworkEnum>;
  selectedChain: Maybe<number>;
  seedPhrase: Maybe<string>;
  creatingStep: CreateAccountStepsEnum;
  backupStep: BackupAccountStepsEnum;
  isWithoutPassword: boolean;
  isRandomChain: boolean;

  isAccountMenuOpened: boolean;
  isShowUnderConstruction: boolean;

  sentData: Maybe<SentData>;

  setSelectedNetwork: (network: Maybe<NetworkEnum>) => void;
  setSelectedChain: (chainId: Maybe<number>) => void;
  setSeedPhrase: (seedPhrase: string) => void;
  setCreatingStep: (step: CreateAccountStepsEnum) => void;
  setBackupStep: (step: BackupAccountStepsEnum) => void;
  setIsRandomChain: (isRandomChain: boolean) => void;
  setIsWithoutPassword: (isWithoutPassword: boolean) => void;
  setIsAccountMenuOpened: (isAccountMenuOpened: boolean) => void;
  setIsShowUnderConstruction: (isShowUnderConstruction: boolean) => void;
  setSentData: (sentData: Maybe<SentData>) => void;
  resetStore: () => void;
}

export const useStore = create<State>((set) => ({
  selectedNetwork: null,
  selectedChain: null,
  seedPhrase: null,
  creatingStep: CreateAccountStepsEnum.selectNetwork,
  backupStep: BackupAccountStepsEnum.generateSeedPhrase,
  isWithoutPassword: false,
  isRandomChain: true,

  isAccountMenuOpened: false,
  isShowUnderConstruction: false,

  sentData: null,

  setSelectedNetwork: (network: Maybe<NetworkEnum>) =>
    set((state) => ({ ...state, selectedNetwork: network })),

  setSelectedChain: (chainId: Maybe<number>) =>
    set((state) => ({ ...state, selectedChain: chainId })),

  setSeedPhrase: (seedPhrase: string) =>
    set((state) => ({ ...state, seedPhrase })),

  setCreatingStep: (step: CreateAccountStepsEnum) =>
    set((state) => ({ ...state, creatingStep: step })),

  setBackupStep: (step: BackupAccountStepsEnum) =>
    set((state) => ({ ...state, backupStep: step })),

  setIsRandomChain: (isRandomChain: boolean) =>
    set((state) => ({ ...state, isRandomChain })),

  setIsWithoutPassword: (isWithoutPassword: boolean) =>
    set((state) => ({ ...state, isWithoutPassword })),

  setIsAccountMenuOpened: (isAccountMenuOpened: boolean) =>
    set((state) => ({ ...state, isAccountMenuOpened })),

  setIsShowUnderConstruction: (isShowUnderConstruction: boolean) =>
    set((state) => ({ ...state, isShowUnderConstruction })),

  setSentData: (sentData: Maybe<SentData>) =>
    set((state) => ({ ...state, sentData })),

  resetStore: () =>
    set(() => ({
      selectedNetwork: null,
      selectedChain: null,
      seedPhrase: null,
      creatingStep: CreateAccountStepsEnum.selectNetwork,
      backupStep: BackupAccountStepsEnum.generateSeedPhrase,
      isWithoutPassword: false,
      isRandomChain: true,
      isAccountMenuOpened: false,
      isShowUnderConstruction: false,
      sentData: null
    }))
}));
