import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NetworkEnum } from '@thepowereco/tssdk';
import { AddActionOnSuccessType, Maybe } from '../../typings/common';
import {
  CreateAccountStepsEnum,
  LoginRegisterAccountTabs,
  LoginToWalletInputType,
  SetSeedPhraseInput,
} from '../typings/registrationTypes';

const SLICE_NAME = 'registration';

export type RegistrationState = {
  tab: LoginRegisterAccountTabs; // old logic
  selectedNetwork: Maybe<NetworkEnum>;
  selectedChain: Maybe<number>;
  seedPhrase: Maybe<string>;
  creatingStep: CreateAccountStepsEnum;
  address: Maybe<string>;
  seed: Maybe<string>;
  password: Maybe<string>;
  confirmedPassword: Maybe<string>;
  passwordsNotEqual: boolean;
  isRandomChain: boolean;
};

const initialState: RegistrationState = {
  tab: LoginRegisterAccountTabs.create,
  selectedNetwork: null,
  selectedChain: null,
  seedPhrase: null,
  creatingStep: CreateAccountStepsEnum.selectChain,
  address: null,
  seed: null,
  password: null,
  confirmedPassword: null,
  passwordsNotEqual: false,
  isRandomChain: true,
};

const registrationSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    setCurrentRegisterCreateAccountTab: (state: RegistrationState, action: PayloadAction<LoginRegisterAccountTabs>) => {
      state.tab = action.payload;
    },
    setSelectedNetwork: (state: RegistrationState, action: PayloadAction<Maybe<NetworkEnum>>) => {
      state.selectedNetwork = action.payload;
    },
    setSelectedChain: (state: RegistrationState, action: PayloadAction<Maybe<number>>) => {
      state.selectedChain = action.payload;
    },
    setSeedPhrase: (state: RegistrationState, action: PayloadAction<SetSeedPhraseInput>) => {
      state.seedPhrase = action.payload.seedPhrase;
      state.creatingStep = action.payload.nextStep;
    },
    setCreatingStep: (state: RegistrationState, action: PayloadAction<CreateAccountStepsEnum>) => {
      state.creatingStep = action.payload;
    },
    seLoginAddress: (state: RegistrationState, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
    setLoginSeed: (state: RegistrationState, action: PayloadAction<string>) => {
      state.seed = action.payload;
    },
    setLoginPassword: (state: RegistrationState, action: PayloadAction<string>) => {
      state.password = action.payload;
      state.passwordsNotEqual = false;
    },
    setLoginConfirmedPassword: (state: RegistrationState, action: PayloadAction<string>) => {
      state.confirmedPassword = action.payload;
      state.passwordsNotEqual = false;
    },
    setPasswordNotEqual: (state: RegistrationState, action: PayloadAction<boolean>) => {
      state.passwordsNotEqual = action.payload;
    },
    toggleRandomChain: (state: RegistrationState) => {
      state.isRandomChain = !state.isRandomChain;
    },
  },
});

export const {
  reducer: registrationReducer,
  actions: {
    setCurrentRegisterCreateAccountTab,
    setSelectedNetwork,
    setSelectedChain,
    setSeedPhrase,
    setCreatingStep,
    seLoginAddress,
    setLoginSeed,
    setLoginPassword,
    setLoginConfirmedPassword,
    setPasswordNotEqual,
    toggleRandomChain,
  },
} = registrationSlice;

export const generateSeedPhrase = createAction(`${SLICE_NAME}/generateSeedPhrase`);
export const createWallet = createAction<AddActionOnSuccessType<{
  password: string;
}>>(`${SLICE_NAME}/createWallet`);
export const loginToWalletFromRegistration = createAction<LoginToWalletInputType>(`${SLICE_NAME}/loginToWallet`);
export const proceedToWallet = createAction(`${SLICE_NAME}/proceedToWallet`);
