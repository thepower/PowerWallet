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
}

export const appQueryKeys = new QueryKeys();
