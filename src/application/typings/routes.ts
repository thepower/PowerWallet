export enum WalletRoutesEnum {
  referralSystem = '/referral-system',
  signAndSend = '/sign-and-send',
  send = '/send',
  tokenSelection = '/selection',
  transactions = '/transactions',
  add = '/add',
  buy = '/buy',
  signup = '/signup',
  root = '/',
  login = '/login',
  sso = '/sso',
}

export type AppQueryParams = {
  callbackUrl?: string;
  returnUrl?: string;
  chainID?: number;
  isShowSeedAfterRegistration?: boolean;
  isAutoDownloadSeed?: boolean;
};
