export enum ChainId {
  c3 = 3,
  c100501 = 100501
}

export enum Token {
  WSK = 'WSK',
  USDC = 'USDC',
  USDT = 'USDT'
}

export type TokenPair = `${string}-${string}`;

export type TokenOption = {
  title: Token;
  value: Token;
};

export interface InitialValues {
  chainId: number;
  amountPay: number;
  amountBuy: number;
  address: string;
  tokenPay: Token;
  tokenBuy: Token;
  lastTouch: 'tokenPay' | 'tokenBuy';
  promoCode: string;
}

export interface TokenData {
  decimals: number;
  symbol: string;
  balance: bigint;
  allowance: bigint;
  refetch: any;
}
