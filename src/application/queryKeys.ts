class QueryKeys {
  walletData = (address?: string | null) => [
    'walletData',
    ...(address ? [address] : [])
  ];
  networkApi = (chainId?: number) => ['networkApi', chainId];
  networkChains = () => ['networkChains'];
  newOrder = (address?: string | null) => [
    'newOrder',
    ...(address ? [address] : [])
  ];
  priceData = (keccack256?: string | null, swapAddress?: string) => [
    'newOrder',
    ...(keccack256 ? [keccack256] : []),
    ...(swapAddress ? [swapAddress] : [])
  ];
  tokenBalance = (address?: string | null, tokenAddress?: string) => [
    'tokenBalance',
    ...(address ? [address] : []),
    ...(tokenAddress ? [tokenAddress] : [])
  ];
  transactionsHistory = (address?: string | null, tokenAddress?: string) => [
    'transactionsHistory',
    ...(address ? [address] : []),
    ...(tokenAddress ? [tokenAddress] : [])
  ];
  tokenTransactionsHistory = (
    address?: string | null,
    tokenAddress?: string
  ) => [
    'tokenTransactionsHistory',
    ...(address ? [address] : []),
    ...(tokenAddress ? [tokenAddress] : [])
  ];
  ERC721Tokens = (address?: string | null, tokenAddress?: string) => [
    'ERC721Tokens',
    ...(address ? [address] : []),
    ...(tokenAddress ? [tokenAddress] : [])
  ];
  tokenDetails = (tokenAddress?: string) => [
    'tokenDetails',
    ...(tokenAddress ? [tokenAddress] : [])
  ];
  vestingDetails = (address?: string | null, id?: string) => [
    'vestingDetails',
    ...(address ? [address] : []),
    ...(id ? [id] : [])
  ];
  userVestings = (address?: string | null) => [
    'userVestings',
    ...(address ? [address] : [])
  ];
  userVesting = (address?: string | null, id?: string) => [
    'userVesting',
    ...(address ? [address] : []),
    ...(id ? [id] : [])
  ];
  claimNodeStatus = (address: string) => ['claimNode', 'status', address];
}

export const appQueryKeys = new QueryKeys();
