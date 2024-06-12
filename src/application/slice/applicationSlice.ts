import {
  createAction,
  createSlice,
  Draft,
  PayloadAction,
} from '@reduxjs/toolkit';
import { ChainNetwork, NetworkApi, WalletApi } from '@thepowereco/tssdk';
import { Maybe } from '../../typings/common';

interface ApplicationDataState {
  showUnderConstruction: boolean;
  networkApi: Maybe<Draft<NetworkApi>>;
  walletApi: Maybe<Draft<WalletApi>>;
  networksChains: Maybe<ChainNetwork>;
}

const SLICE_NAME = 'applicationData';

const initialState: ApplicationDataState = {
  showUnderConstruction: false,
  networkApi: null,
  walletApi: null,
  networksChains: null,
};

const applicationDataSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    setDynamicApis: (
      state: ApplicationDataState,
      { payload }: PayloadAction<{ networkApi: NetworkApi, walletApi: WalletApi }>,
    ) => {
      state.networkApi = payload.networkApi;
      state.walletApi = payload.walletApi;
    },
    setShowUnderConstruction: (state: ApplicationDataState, action: PayloadAction<boolean>) => {
      state.showUnderConstruction = action.payload;
    },
    setNetworkChains: (state: ApplicationDataState, action: PayloadAction<ChainNetwork>) => {
      state.networksChains = action.payload;
    },
  },
});

export const initApplication = createAction(`${SLICE_NAME}/initApplication`);

export const {
  reducer: applicationDataReducer,
  actions: {
    setDynamicApis,
    setShowUnderConstruction,
    setNetworkChains,
  },
} = applicationDataSlice;
