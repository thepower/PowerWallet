import { Store } from '@tanstack/react-store';
import { NetworkEnum } from '@thepowereco/tssdk';
import {
  BackupAccountStepsEnum,
  CreateAccountStepsEnum
} from 'registration/typings/registrationTypes';
import { Maybe } from 'typings/common';

interface State {
  selectedNetwork: Maybe<NetworkEnum>;
  selectedChain: Maybe<number>;
  seedPhrase: Maybe<string>;
  creatingStep: CreateAccountStepsEnum;
  backupStep: BackupAccountStepsEnum;
  isWithoutPassword: boolean;
  isRandomChain: boolean;
}

const initialState: State = {
  selectedNetwork: null,
  selectedChain: null,
  seedPhrase: null,
  creatingStep: CreateAccountStepsEnum.selectNetwork,
  backupStep: BackupAccountStepsEnum.generateSeedPhrase,
  isWithoutPassword: false,
  isRandomChain: true
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

export const resetStore = () => setState(() => initialState);
