import i18n from 'locales/initTranslation';

export type LoadBalanceType = {
  amount: {
    [key: string]: number;
  };
  lastblk: string;
  preblk: string;
  pubkey: string;
  seq: number;
  t: number;
};

export type TransactionType = {
  id: string;
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
  txext: { msg?: string; sponsor?: string[] } | never[];
  ver: number;
  timestamp: number;
  cur: string;
  amount: number;
  inBlock: string;
  blockNumber: number;
};

export enum TokenKind {
  Erc20 = 'erc20',
  Erc721 = 'erc721',
  Native = 'native'
}

export enum MyAssetsTabs {
  Erc20 = 'Erc20',
  Erc721 = 'Erc721'
}

export const getMyAssetsTabsLabels = () =>
  ({
    Erc20: 'ERC-20',
    Erc721: 'NFT'
  }) as const;

export enum AddTokensTabs {
  Erc20 = 'Erc20',
  Erc721 = 'Erc721',
  AddTokens = 'AddTokens'
}

export const getAddTokenTabsLabels = () =>
  ({
    Erc20: 'ERC-20',
    Erc721: 'NFT',
    AddTokens: i18n.t('addOtherTokens')
  }) as const;

export type TToken = {
  type: TokenKind;
  name: string;
  address: string;
  symbol: string;
  chainId: number | null;
  decimals: number;
  isShow?: boolean;
};

export type TErc721Token = {
  id: string;
  name?: string;
  description?: string;
  image?: string;
};

export type TokenPayloadType = TToken;
export type Erc721TokenPayloadType = TErc721Token[];
export const nativeTokensNameMap = { SK: 'Smart key' };
