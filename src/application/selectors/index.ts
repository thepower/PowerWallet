import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../reduxStore';

export const getApplicationState = (state: RootState) => state.applicationData;

export const getNetworkApi = createSelector(
  getApplicationState,
  (applicationData) => applicationData.networkApi
);
export const getNetworkFeeSettings = createSelector(
  getApplicationState,
  (applicationData) => applicationData.networkApi?.feeSettings
);
export const getNetworkGasSettings = createSelector(
  getApplicationState,
  (applicationData) => applicationData.networkApi?.gasSettings
);
export const getNetworkChainID = createSelector(
  getApplicationState,
  (applicationData) => applicationData.networkApi?.getChain()
);
export const getWalletApi = createSelector(
  getApplicationState,
  (applicationData) => applicationData.walletApi
);
export const getNetworksChains = createSelector(
  getApplicationState,
  (applicationData) => applicationData.networksChains
);
