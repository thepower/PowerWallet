import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TxBody } from 'sign-and-send/typing';
import { AddActionOnSuccessAndErrorType, Maybe } from '../../typings/common';

export type SentData = {
  from: string;
  to: string;
  amount: number | string;
  comment: Maybe<string>;
  txId: string;
  returnURL?: string;
};

type InitialState = {
  sentData: Maybe<SentData>;
};

const initialState: InitialState = {
  sentData: null
};

const sendSlice = createSlice({
  name: 'send',
  initialState,
  reducers: {
    setSentData: (
      state,
      { payload }: PayloadAction<NonNullable<InitialState['sentData']>>
    ) => {
      state.sentData = payload;
    },
    clearSentData: (state) => {
      state.sentData = null;
    }
  }
});

export const sendTrxTrigger = createAction<{
  wif: string;
  to: string;
  amount: string;
  comment: Maybe<string>;
}>('send/sendTrxTrigger');

export const sendTokenTrxTrigger = createAction<{
  wif: string;
  to: string;
  address: string;
  decimals: string;
  amount: string;
}>('send/sendTokenTrxTrigger');
export const sendErc721TokenTrxTrigger = createAction<{
  wif: string;
  to: string;
  address: string;
  id: string;
}>('send/sendErc721TokenTrxTrigger');

export const signAndSendTrxTrigger = createAction<
  AddActionOnSuccessAndErrorType<{
    wif: string;
    decodedTxBody: TxBody;
    returnURL?: string;
  }>
>('send/signAndSendTrxTrigger');

export const {
  actions: { setSentData, clearSentData },
  reducer: sendReducer
} = sendSlice;
