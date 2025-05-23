export enum RoutesEnum {
  // referralProgram = '/referral-program',
  signAndSend = '/sign-and-send',
  send = '/send',
  tokenSelection = '/selection',
  transactions = '/transactions',
  add = '/add',
  // buy = '/buy',
  // crypto = '/crypto',
  // fiat = '/fiat',
  signup = '/signup',
  root = '/',
  login = '/login',
  sso = '/sso',
  // vesting = '/vesting',
  claimNode = '/claim-node'
}

export type AppQueryParams = {
  callbackUrl?: string;
  returnUrl?: string;
  chainID?: number;
};
