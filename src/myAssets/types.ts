import i18n from 'locales/initTranslation';

export type LoadBalanceType = {
  amount: {
    [key: string]: number;
  };
  lastblock: {
    tx: number;
  };
  pubkey: string;
  seq: number;
  t: number;
};

export type BlockType<T = TransactionType> = {
  child: string;
  etxs: any[];
  extdata: {
    prevnodes: any[];
  };
  failed: any[];
  hash: string;
  header: Header;
  ledger_patch: LedgerPatchItem[];
  receipt: ReceiptItem[];
  settings: any[];
  sign: SignItem[];
  txs: {
    [key: string]: T;
  };
  _install_t: number;
};

type Header = {
  chain: number;
  height: number;
  parent: string;
  roots: {
    ledger_patch_root: string;
    txroot: string;
    ledger_hash: string;
    entropy: string;
    log_hash: string;
    mean_time: string;
    cumulative_gas: string;
    receipt_root: string;
  };
  ver: number;
};

type LedgerPatchItem = (string | number | any[])[];
type ReceiptItem = [
  number,
  string,
  string,
  number,
  string,
  number,
  number,
  any[]
];

type SignItem = {
  _nodeid: string;
  _nodename: string;
  beneficiary: string;
  binextra: string;
  extra: {
    pubkey: string;
    timestamp: number;
    createduration: number;
  };
  signature: string;
  local_data?: string;
};

export type TransactionType = {
  id: string;
  body: string;
  call: {
    args: string[];
    function: string;
  };
  extdata: {
    origin: string;
  };
  from: string;
  kind: string;
  payload: { amount: number; cur: string; purpose: string }[];
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
};

export type TransactionFormattedType = TransactionType & {
  currency: string;
  amount: string;
  blockHeight: number;
  blockHash: string;
  txHash?: string;
  tokenId?: string;
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
