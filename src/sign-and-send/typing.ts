export enum TxKindByName {
  'generic' = 16,
  'register' = 17,
  'deploy' = 18,
  'patch' = 19,
  'block' = 20,
  'lstore' = 22,
  'notify' = 23,
  'chkey' = 24
}

// TODO export from lib
export enum TxTag {
  PUBLIC_KEY = 0x02,
  SIGNATURE = 0xff
}

export enum TxPurpose {
  TRANSFER = 0x00,
  SRCFEE = 0x01,
  SPONSOR_SRCFEE = 0x21,
  GAS = 0x03,
  SPONSOR_GAS = 0x23
}

export enum TxKind {
  GENERIC = 0x10,
  REGISTER = 0x11,
  DEPLOY = 0x12,
  PATCH = 0x13,
  LSTORE = 22
}

export interface TxBody {
  k: TxKind;
  t: bigint;
  f: Uint8Array;
  to: Uint8Array;
  s: bigint;
  p: Array<[TxPurpose, string, bigint]>;
  e?: {
    sponsor?: Uint8Array;
    msg?: string;
  };
  c?: [string, Uint8Array];
  pa?: Uint8Array;
}
