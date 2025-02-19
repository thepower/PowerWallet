import { bscTestnet, bsc } from 'viem/chains';
import { defineChain } from 'viem/utils';
import appEnvs from 'appEnvs';
import { TokenOption, TokenPair, ChainId, Token } from './types';

export const REFRESH_INTERVAL = 10000;
export const TARGET_TIME_OFFSET = 300n;
export const DEBOUNCE_TIMEOUT = 300;

export const payTokens: TokenOption[] = [
  {
    title: Token.USDT,
    value: Token.USDT
  }
];

export const buyTokens: TokenOption[] = [
  {
    title: Token.WSK,
    value: Token.WSK
  }
];

export const swapsMap: Record<string, Record<TokenPair, `0x${string}`>> = {
  [`${bscTestnet.id}-${ChainId.c3}`]: {
    [`${Token.USDC}-${Token.WSK}`]:
      appEnvs.C97_C3_SWAP_USDC_TO_SK_EVM_CONTRACT_ADDRESS,
    [`${Token.USDT}-${Token.WSK}`]:
      appEnvs.C97_C3_SWAP_USDT_TO_SK_EVM_CONTRACT_ADDRESS
  },
  [`${bsc.id}-${ChainId.c100501}`]: {
    [`${Token.USDC}-${Token.WSK}`]:
      appEnvs.C56_C100501_SWAP_USDC_TO_SK_EVM_CONTRACT_ADDRESS,
    [`${Token.USDT}-${Token.WSK}`]:
      appEnvs.C56_C100501_SWAP_USDT_TO_SK_EVM_CONTRACT_ADDRESS
  }
};

export const bridgeTokensMap: Record<
  string,
  Record<TokenPair, `0x${string}`>
> = {
  [`${bscTestnet.id}-${ChainId.c3}`]: {
    [`${Token.WSK}-${Token.WSK}`]: appEnvs.C97_WSK_EVM_CONTRACT_ADDRESS,
    [`${Token.USDC}-${Token.USDC}`]: appEnvs.C97_USDC_EVM_CONTRACT_ADDRESS,
    [`${Token.USDT}-${Token.USDT}`]: appEnvs.C97_USDT_EVM_CONTRACT_ADDRESS
  },
  [`${bsc.id}-${ChainId.c100501}`]: {
    [`${Token.WSK}-${Token.WSK}`]: appEnvs.C97_WSK_EVM_CONTRACT_ADDRESS,
    [`${Token.USDC}-${Token.USDC}`]: appEnvs.C97_USDC_EVM_CONTRACT_ADDRESS,
    [`${Token.USDT}-${Token.USDT}`]: appEnvs.C97_USDT_EVM_CONTRACT_ADDRESS
  }
};

export const bridgeMap: Record<string, `0x${string}`> = {
  [`${bscTestnet.id}-${ChainId.c3}`]:
    appEnvs.C97_C3_BRIDGE_EVM_CONTRACT_ADDRESS,
  [`${bsc.id}-${ChainId.c100501}`]:
    appEnvs.C56_C100501_BRIDGE_EVM_CONTRACT_ADDRESS
};

export const chains = {
  [ChainId.c3]: defineChain({
    id: 1000000003,
    name: 'POWER',
    nativeCurrency: {
      decimals: 18,
      name: 'SK',
      symbol: 'tSK'
    },
    rpcUrls: {
      default: {
        http: ['https://c3n2.thepower.io:1446/jsonrpc']
      }
    },
    testnet: true
  }),
  [ChainId.c100501]: defineChain({
    id: 100501,
    name: 'POWER',
    nativeCurrency: {
      decimals: 18,
      name: 'SK',
      symbol: 'SK'
    },
    rpcUrls: {
      default: {
        http: ['https://c100501n3.deinfra.net/jsonrpc']
      }
    }
  })
};
