import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NetworkEnum } from '@thepowereco/tssdk';
import { AddActionOnSuccessType, Maybe } from '../../typings/common';
import {
  BackupAccountStepsEnum,
  CreateAccountStepsEnum,
  LoginToWalletInputType,
  SetSeedPhraseInput,
} from '../typings/registrationTypes';

const SLICE_NAME = 'registration';

export type RegistrationState = {
  selectedNetwork: Maybe<NetworkEnum>;
  selectedChain: Maybe<number>;
  seedPhrase: Maybe<string>;
  creatingStep: CreateAccountStepsEnum;
  backupStep: BackupAccountStepsEnum;
  isWithoutPassword: boolean;
  isRandomChain: boolean;
};

const initialState: RegistrationState = {
  selectedNetwork: null,
  selectedChain: null,
  seedPhrase: null,
  creatingStep: CreateAccountStepsEnum.selectNetwork,
  backupStep: BackupAccountStepsEnum.generateSeedPhrase,
  isWithoutPassword: false,
  isRandomChain: true,
};

const registrationSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    setSelectedNetwork: (
      state: RegistrationState,
      action: PayloadAction<Maybe<NetworkEnum>>,
    ) => {
      state.selectedNetwork = action.payload;
    },
    setSelectedChain: (
      state: RegistrationState,
      action: PayloadAction<Maybe<number>>,
    ) => {
      state.selectedChain = action.payload;
    },
    setSeedPhrase: (
      state: RegistrationState,
      action: PayloadAction<SetSeedPhraseInput>,
    ) => {
      state.seedPhrase = action.payload.seedPhrase;
      state.creatingStep = action.payload.nextStep;
    },
    setCreatingStep: (
      state: RegistrationState,
      action: PayloadAction<CreateAccountStepsEnum>,
    ) => {
      state.creatingStep = action.payload;
    },
    setBackupStep: (
      state: RegistrationState,
      action: PayloadAction<BackupAccountStepsEnum>,
    ) => {
      state.backupStep = action.payload;
    },
    setIsRandomChain: (
      state: RegistrationState,
      action: PayloadAction<boolean>,
    ) => {
      state.isRandomChain = action.payload;
    },
    setIsWithoutPassword: (
      state: RegistrationState,
      action: PayloadAction<boolean>,
    ) => {
      state.isWithoutPassword = action.payload;
    },
  },
});

export const {
  reducer: registrationReducer,
  actions: {
    setSelectedNetwork,
    setSelectedChain,
    setSeedPhrase,
    setCreatingStep,
    setBackupStep,
    setIsRandomChain,
    setIsWithoutPassword,
  },
} = registrationSlice;

export const generateSeedPhrase = createAction(
  `${SLICE_NAME}/generateSeedPhrase`,
);
export const createWallet = createAction<
AddActionOnSuccessType<{
  password: string;
  referrer?: string;
}>
>(`${SLICE_NAME}/createWallet`);
export const loginToWalletFromRegistration =
  createAction<LoginToWalletInputType>(`${SLICE_NAME}/loginToWallet`);
export const proceedToWallet = createAction(`${SLICE_NAME}/proceedToWallet`);
