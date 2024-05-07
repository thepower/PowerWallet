import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'application/store';
import type { TToken } from 'myAssets/types';

const getWalletState = (state: RootState) => state.wallet;

export const getWalletInitialLastBlock = createSelector(getWalletState, (wallet) => wallet.initialLastBlock);
export const getWalletLastBlock = createSelector(getWalletState, (wallet) => wallet.lastblk);
export const getWalletNativeTokensAmounts = createSelector(getWalletState, (wallet) => wallet.amounts);

export const getWalletNativeTokens = createSelector(getWalletState, (wallet) => Object.entries(wallet.amounts).map(
  ([symbol, amount]) => ({
    type: 'native',
    name: symbol,
    address: symbol,
    symbol,
    decimals: '9',
    amount,
    isShow: true,
  } as TToken),
));

export const getWalletNativeTokensAmountBySymbol = createSelector(
  [getWalletState, (_, symbol) => symbol],
  (wallet, symbol) => wallet.amounts?.[symbol],
);
export const getWalletPubKey = createSelector(getWalletState, (wallet) => wallet.pubkey);
export const getPrevBlock = createSelector(getWalletState, (wallet) => wallet.preblk);
