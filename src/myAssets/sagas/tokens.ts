import { AddressApi, NetworkApi } from '@thepowereco/tssdk';

import { getWalletAddress } from 'account/selectors/accountSelectors';

import { getNetworkApi, getNetworkChainID } from 'application/selectors';
import { WalletRoutesEnum } from 'application/typings/routes';
import { push } from 'connected-react-router';
import i18n from 'locales/initTranslation';
import { getTokenByID, getTokens } from 'myAssets/selectors/tokensSelectors';
import {
  addErc721Tokens,
  addToken,
  addTokenTrigger,
  getErc721TokensTrigger,
  updateTokenAmount,
} from 'myAssets/slices/tokensSlice';
import { toast } from 'react-toastify';
import {
  all, put, select, call,
} from 'typed-redux-saga';

import abis from 'abis';
import { range } from 'lodash';
import axios, { AxiosResponse } from 'axios';
import { TokenKind } from 'myAssets/types';

export function* getIsErc721(network: NetworkApi, address: string) {
  try {
    const isErc721: boolean = yield network.executeCall(
      AddressApi.textAddressToHex(address),
      'supportsInterface',
      ['0x80ac58cd'],
      abis.erc721.abi,
    );
    return isErc721;
  } catch {
    return false;
  }
}

export function* addTokenSaga({
  payload: { address, withoutRedirect, additionalActionOnSuccess },
}: ReturnType<typeof addTokenTrigger>) {
  try {
    const tokens = yield* select(getTokens);

    const existedToken = tokens.find((token) => token.address === address);

    if (existedToken && existedToken?.chainId) {
      toast.error(i18n.t('tokenHasAlreadyBeenAdded'));
      return;
    }

    const networkAPI = (yield* select(getNetworkApi))!;
    const contractNetworkApi = networkAPI;
    const { chain }: { chain?: number } = yield networkAPI.getAddressChain(
      address,
    );

    if (!chain) {
      toast.error(i18n.t('addressNotFound'));
    }

    if (chain !== networkAPI.getChain()) {
      toast.error(i18n.t('wrongChain'));
    }

    const isErc721 = yield* getIsErc721(
      contractNetworkApi as NetworkApi,
      address,
    );

    if (isErc721) {
      const walletAddress: string = yield* select(getWalletAddress);

      const name: string = yield contractNetworkApi.executeCall(
        AddressApi.textAddressToHex(address),
        'name',
        [],
        abis.erc721.abi,
      );
      const symbol: string = yield contractNetworkApi.executeCall(
        AddressApi.textAddressToHex(address),
        'symbol',
        [],
        abis.erc721.abi,
      );
      const balanceBigint: bigint = yield contractNetworkApi.executeCall(
        AddressApi.textAddressToHex(address),
        'balanceOf',
        [AddressApi.textAddressToEvmAddress(walletAddress)],
        abis.erc721.abi,
      );
      const balance = balanceBigint.toString();
      yield put(
        addToken({
          name,
          symbol,
          address,
          decimals: '1',
          type: TokenKind.Erc721,
          chainId: chain!,
          amount: balance,
          isShow: true,
        }),
      );
    } else {
      const walletAddress: string = yield* select(getWalletAddress);

      const name: string = yield contractNetworkApi.executeCall(
        AddressApi.textAddressToHex(address),
        'name',
        [],
        abis.erc20.abi,
      );
      const symbol: string = yield contractNetworkApi.executeCall(
        AddressApi.textAddressToHex(address),
        'symbol',
        [],
        abis.erc20.abi,
      );
      const balanceBigint: bigint = yield contractNetworkApi.executeCall(
        AddressApi.textAddressToHex(address),
        'balanceOf',
        [AddressApi.textAddressToEvmAddress(walletAddress)],
        abis.erc20.abi,
      );
      const balance = balanceBigint.toString();
      const decimalsBigint: bigint = yield contractNetworkApi.executeCall(
        AddressApi.textAddressToHex(address),
        'decimals',
        [],
        abis.erc20.abi,
      );
      const decimals = decimalsBigint.toString();

      yield put(
        addToken({
          name,
          symbol,
          address,
          decimals,
          chainId: chain!,
          type: TokenKind.Erc20,
          amount: balance,
          isShow: true,
        }),
      );
    }
    if (!withoutRedirect) yield* put(push(WalletRoutesEnum.root));
    additionalActionOnSuccess?.();
  } catch (error: any) {
    toast.error(`${i18n.t('somethingWentWrongCode')} ${error?.code}`);
  }
}

export function* updateTokenAmountSaga({ address }: { address: string, isErc721?: boolean }) {
  const networkAPI = (yield* select(getNetworkApi))!;
  const contractNetworkApi = networkAPI;
  const { chain }: { chain?: number } = yield networkAPI.getAddressChain(
    address,
  );

  if (!chain) {
    toast.error(i18n.t('addressNotFound'));
  }

  const token = yield* select(getTokenByID, address);

  if (!token || !token?.type) {
    return;
  }

  if (token.type === TokenKind.Erc721) {
    const walletAddress: string = yield* select(getWalletAddress);
    const balanceBigint: bigint = yield contractNetworkApi.executeCall(
      AddressApi.textAddressToHex(address),
      'balanceOf',
      [AddressApi.textAddressToEvmAddress(walletAddress)],
      abis.erc721.abi,
    );
    const balance = balanceBigint.toString();

    yield put(updateTokenAmount({ address, amount: balance }));
  } else {
    const walletAddress: string = yield* select(getWalletAddress);

    const balanceBigint: bigint = yield contractNetworkApi.executeCall(
      AddressApi.textAddressToHex(address),
      'balanceOf',
      [AddressApi.textAddressToEvmAddress(walletAddress)],
      abis.erc20.abi,
    );

    const balance = balanceBigint.toString();
    yield put(updateTokenAmount({ address, amount: balance }));
  }
}

export function* updateTokensAmountsSaga() {
  const tokens = yield* select(getTokens);
  const chainId = yield* select(getNetworkChainID);

  const chainTokens = tokens.filter((token) => token?.chainId === chainId);

  yield all(
    chainTokens.map(({ address }) => ({ address })).map(updateTokenAmountSaga),
  );
}

async function getMetaData(uri: string) {
  try {
    const res: AxiosResponse<{
      name?: string;
      description?: string;
      image?: string;
    }> = await axios.get(uri);

    return res.data;
  } catch (error) {
    return null;
  }
}

export function* getErc721Token(id: number, address: string) {
  const networkAPI = (yield* select(getNetworkApi))!;
  const walletAddress: string = yield* select(getWalletAddress);

  const tokenIdBigint: bigint = yield networkAPI.executeCall(
    AddressApi.textAddressToHex(address),
    'tokenOfOwnerByIndex',
    [AddressApi.textAddressToEvmAddress(walletAddress), id],
    abis.erc721.abi,
  );

  const tokenId = tokenIdBigint.toString();

  const uri: string = yield networkAPI.executeCall(
    AddressApi.textAddressToHex(address),
    'tokenURI',
    [tokenId],
    abis.erc721.abi,
  );

  if (!uri) {
    return { id: tokenId };
  }

  const metadata = yield* call(getMetaData, uri);

  if (metadata?.image) {
    return {
      id: tokenId,
      name: metadata?.name || '',
      description: metadata?.description || '',
      image: metadata?.image || '',
    };
  }
  return { id: tokenId, image: uri };
}

export function* getErc721TokensSaga({
  payload: { address },
}: ReturnType<typeof getErc721TokensTrigger>) {
  yield put(addErc721Tokens([]));

  const networkAPI = (yield* select(getNetworkApi))!;
  const walletAddress: string = yield* select(getWalletAddress);

  const balanceBigint: bigint = yield networkAPI.executeCall(
    AddressApi.textAddressToHex(address),
    'balanceOf',
    [AddressApi.textAddressToEvmAddress(walletAddress)],
    abis.erc721.abi,
  );
  const balance = Number(balanceBigint);

  const tokens = yield* all(
    range(0, balance).map((id) => getErc721Token(id, address)),
  );

  yield put(addErc721Tokens(tokens));
}
