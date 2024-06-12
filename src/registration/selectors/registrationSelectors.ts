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

export const getCurrentCreatingStep = createSelector(
  getRegistrationState,
  (registrationState) => (
    registrationState.creatingStep
  ),
);

export const getCurrentBackupStep = createSelector(
  getRegistrationState,
  (registrationState) => (
    registrationState.backupStep
  ),
);

export const getGeneratedSeedPhrase = createSelector(
  getRegistrationState,
  (registrationState) => (
    registrationState.seedPhrase
  ),
);

export const getIsRandomChain = createSelector(
  getRegistrationState,
  (registrationState) => (
    registrationState.isRandomChain
  ),
);

export const getIsWithoutPassword = createSelector(
  getRegistrationState,
  (registrationState) => (
    registrationState.isWithoutPassword
  ),
);
