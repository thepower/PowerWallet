import {
  PayloadAction, createAction, createEntityAdapter, createSlice,
} from '@reduxjs/toolkit';
import {
  TErc721Token, TToken, TokenPayloadType, Erc721TokenPayloadType,
} from 'myAssets/types';
import { AddActionOnSuccessType } from 'typings/common';

export const tokensAdapter = createEntityAdapter<TToken>({ selectId: (model) => model.address });

type InitialState = {
  list: ReturnType<typeof tokensAdapter.getInitialState>;
  erc721List: TErc721Token[]
};

const initialState: InitialState = {
  list: tokensAdapter.getInitialState(),
  erc721List: [],
};

const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    addToken: (state, { payload }: PayloadAction<TokenPayloadType>) => {
      tokensAdapter.setOne(state.list, payload);
    },
    addTokens: (state, { payload }: PayloadAction<TokenPayloadType[]>) => {
      tokensAdapter.setAll(state.list, payload);
    },
    addErc721Tokens: (state, { payload }: PayloadAction<Erc721TokenPayloadType>) => {
      state.erc721List = payload;
    },
    toggleTokenShow: (state, { payload }: PayloadAction<{ address: string, isShow: boolean }>) => {
      tokensAdapter.updateOne(state.list, { id: payload.address, changes: { isShow: payload.isShow } });
    },
    updateTokenAmount: (state, { payload }: PayloadAction<{ address: string, amount: string }>) => {
      tokensAdapter.updateOne(state.list, { id: payload.address, changes: { amount: payload.amount } });
    },
  },
});

export const addTokenTrigger = createAction<AddActionOnSuccessType<{ address: string, withoutRedirect?: boolean }>>('addToken');
export const updateTokensAmountsTrigger = createAction('updateTokensAmounts');
export const toggleTokenShowTrigger = createAction<{ address: string, isShow: boolean }>('toggleTokenShow');
export const getErc721TokensTrigger = createAction<{ address: string }>('getErc721Tokens');

export const {
  actions: {
    addToken,
    addTokens,
    addErc721Tokens,
    toggleTokenShow,
    updateTokenAmount,
  },
  reducer: tokensReducer,
} = tokensSlice;
