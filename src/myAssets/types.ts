import i18n from 'locales/initTranslation';

export type LoadBalancePayloadType = {
  amount: {
    [key: string]: number;
  };
  lastblk: string;
  preblk: string;
  pubkey: string;
};

export type TransactionPayloadType = {
  body: string;
  extdata: {
    origin: string;
  };
  from: string;
  kind: string;
  payload: { amout: number; cur: string; purpose: string }[];
  seq: number;
  sig: {
    [key: string]: string;
  };
  sigverify: {
    invalid: number;
    pubkeys: string[];
    valid: number;
  };
  t: number;
  to: string;
  txext: { msg: string } | never[];
  ver: number;
  timestamp: number;
  cur: string;
  amount: number;
  inBlock: string;
  blockNumber: number;
};

export enum MyAssetsTabs {
  Erc20 = 'Erc20',
  NFT = 'NFT',
}

export const getMyAssetsTabsLabels = () => ({
  Erc20: 'ERC-20',
  NFT: 'NFT',
} as const);

export enum AddTokensTabs {
  Erc20 = 'Erc20',
  NFT = 'NFT',
  AddTokens = 'AddTokens',
}

export const getAddTokenTabsLabels = () => ({
  Erc20: 'ERC-20',
  NFT: 'NFT',
  AddTokens: i18n.t('addOtherTokens'),
} as const);

export type TokenKind = 'nft' | 'erc20' | 'native';

export type Token = {
  type: TokenKind;
  name: string;
  address: string;
  symbol: string;
  decimals: string;
  amount?: string
  isShow?: boolean;
};

export type TokenPayloadType = Token;

export const nativeTokensNameMap = { SK: 'Smart key' };
