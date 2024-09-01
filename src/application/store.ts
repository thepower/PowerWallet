import { Store } from '@tanstack/react-store';
import { NetworkEnum } from '@thepowereco/tssdk';
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
}

const initialState: State = {
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
};

export const store = new Store<State>(initialState);

export const { setState } = store;

export const setSelectedNetwork = (network: NetworkEnum) => {
  setState((prevState) => ({
    ...prevState,
    selectedNetwork: network
  }));
};

export const setSelectedChain = (chainId: number) => {
  setState((prevState) => ({
    ...prevState,
    selectedChain: chainId
  }));
};

export const setSeedPhrase = (seedPhrase: string) => {
  setState((prevState) => ({
    ...prevState,
    seedPhrase: seedPhrase
  }));
};

export const setCreatingStep = (step: CreateAccountStepsEnum) => {
  setState((prevState) => ({
    ...prevState,
    creatingStep: step
  }));
};

export const setBackupStep = (step: BackupAccountStepsEnum) => {
  setState((prevState) => ({
    ...prevState,
    backupStep: step
  }));
};

export const setIsRandomChain = (isRandomChain: boolean) => {
  setState((prevState) => ({
    ...prevState,
    isRandomChain
  }));
};

export const setIsWithoutPassword = (isWithoutPassword: boolean) => {
  setState((prevState) => ({
    ...prevState,
    isWithoutPassword
  }));
};

export const setIsAccountMenuOpened = (isAccountMenuOpened: boolean) => {
  setState((prevState) => ({
    ...prevState,
    isAccountMenuOpened
  }));
};

export const setIsShowUnderConstruction = (
  isShowUnderConstruction: boolean
) => {
  setState((prevState) => ({
    ...prevState,
    isShowUnderConstruction
  }));
};

export const setSentData = (sentData: Maybe<SentData>) => {
  setState((prevState) => ({
    ...prevState,
    sentData
  }));
};

export const resetStore = () => setState(() => initialState);
