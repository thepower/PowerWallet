import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'application/store';
import { tokensAdapter } from '../slices/tokensSlice';

const getTokensState = (state: RootState) => state.tokens;

const { selectAll, selectById, selectIds } = tokensAdapter.getSelectors(
  (state: RootState) => state.tokens.list
);

export const getTokens = createSelector(selectAll, (tokens) => tokens);

export const getTokensIds = createSelector(selectIds, (ids) => ids);

export const getTokenByID = createSelector(selectById, (token) => token);

export const getErc721Tokens = createSelector(
  getTokensState,
  (tokens) => tokens.erc721List
);
