import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'application/store';

export const getRegistrationState = (state: RootState) => (
  state.registration
);

export const getSelectedNetwork = createSelector(
  getRegistrationState,
  (registrationState) => (
    registrationState.selectedNetwork
  ),
);

export const getSelectedChain = createSelector(
  getRegistrationState,
  (registrationState) => (
    registrationState.selectedChain
  ),
);

export const getCurrentRegistrationTab = createSelector(
  getRegistrationState,
  (registrationState) => (
    registrationState.tab
  ),
);

export const getCurrentCreatingStep = createSelector(
  getRegistrationState,
  (registrationState) => (
    registrationState.creatingStep
  ),
);

export const getGeneratedSeedPhrase = createSelector(
  getRegistrationState,
  (registrationState) => (
    registrationState.seedPhrase
  ),
);

export const getLoginData = createSelector(
  getRegistrationState,
  (registrationState) => ({
    address: registrationState.address,
    seed: registrationState.seed,
    password: registrationState.password, // TODO remove
    confirmedPassword: registrationState.confirmedPassword, // TODO remove
    passwordsNotEqual: registrationState.passwordsNotEqual, // TODO remove
    isRandomChain: registrationState.isRandomChain, // TODO remove
  }),
);

export const getGeneratedAddress = createSelector(
  getRegistrationState,
  (registrationState) => (
    registrationState.address
  ),
);

export const getIsRandomChain = createSelector(
  getRegistrationState,
  (registrationState) => (
    registrationState.isRandomChain
  ),
);
