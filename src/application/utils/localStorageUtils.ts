import { useCallback, useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { TToken } from 'myAssets/types';

export interface Wallet {
  chainId: number;
  address: string;
  encryptedWif: string;
}

export const useWallets = () => {
  const [wallets, setWallets] = useLocalStorage<Wallet[]>(
    'thepowereco/wallets',
    []
  );
  const [activeAddress, setActiveAddress] = useLocalStorage<string | null>(
    'thepowereco/activeAddress',
    null
  );

  // Функция для проверки уникальности адреса
  const isAddressUnique = useCallback(
    (address: string): boolean => {
      return !wallets.some((wallet) => wallet.address === address);
    },
    [wallets]
  );

  // Функция для добавления нового кошелька
  const addWallet = useCallback(
    async (newWallet: Wallet) => {
      if (!isAddressUnique(newWallet.address)) {
        return;
      }

      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);

      setActiveAddress(newWallet.address);
    },
    [isAddressUnique, setActiveAddress, setWallets, wallets]
  );

  // Функция для обновления кошелька по адресу
  const updateWallet = useCallback(
    async (address: string, updatedData: Partial<Wallet>) => {
      const updatedWallets = wallets.map((wallet) =>
        wallet.address === address ? { ...wallet, ...updatedData } : wallet
      );
      setWallets(updatedWallets);
    },
    [setWallets, wallets]
  );

  // Функция для удаления кошелька по адресу
  const removeWallet = useCallback(
    async (address: string) => {
      const updatedWallets = wallets.filter(
        (wallet) => wallet.address !== address
      );
      setWallets(updatedWallets);

      if (activeAddress === address) {
        const newActiveAddress =
          updatedWallets.length > 0 ? updatedWallets[0].address : null;
        setActiveAddress(newActiveAddress);
      }
    },
    [wallets, setWallets, activeAddress, setActiveAddress]
  );

  // Функция для получения кошелька по адресу
  const getWalletByAddress = useCallback(
    (address: string) => {
      return wallets.find((wallet) => wallet.address === address) || null;
    },
    [wallets]
  );

  // Вычисляем активный кошелек
  const activeWallet = useMemo(() => {
    return activeAddress ? getWalletByAddress(activeAddress) : null;
  }, [activeAddress, getWalletByAddress]);

  // Функция для установки активного кошелька
  const setActiveWalletByAddress = useCallback(
    (address: string) => {
      if (getWalletByAddress(address)) {
        setActiveAddress(address);
      }
    },
    [getWalletByAddress, setActiveAddress]
  );

  // Очистка всех кошельков
  const clearWallets = useCallback(async () => {
    setWallets([]);
    setActiveAddress(null);
  }, [setActiveAddress, setWallets]);

  return {
    wallets,
    activeWallet,
    addWallet,
    updateWallet,
    removeWallet,
    getWalletByAddress,
    setActiveWalletByAddress,
    clearWallets
  };
};

export const useTokens = () => {
  const [tokens, setTokens] = useLocalStorage<TToken[]>(
    'thepowereco/tokens',
    []
  );

  // Function to check if a token address is unique
  const isAddressUnique = useCallback(
    (address: string): boolean => {
      return !tokens.some((token) => token.address === address);
    },
    [tokens]
  );

  // Function to add a new token
  const addToken = useCallback(
    async (newToken: TToken) => {
      if (!isAddressUnique(newToken.address)) {
        return;
      }

      const updatedTokens = [...tokens, newToken];
      setTokens(updatedTokens);
    },
    [isAddressUnique, setTokens, tokens]
  );

  // Function to update a token by address
  const updateToken = useCallback(
    async (address: string, updatedData: Partial<TToken>) => {
      const updatedTokens = tokens.map((token) =>
        token.address === address ? { ...token, ...updatedData } : token
      );
      setTokens(updatedTokens);
    },
    [setTokens, tokens]
  );

  // Function to remove a token by address
  const removeToken = useCallback(
    async (address: string) => {
      const updatedTokens = tokens.filter((token) => token.address !== address);
      setTokens(updatedTokens);
    },
    [setTokens, tokens]
  );

  // Function to get a token by address
  const getTokenByAddress = useCallback(
    (address: string) => {
      return tokens.find((token) => token.address === address) || null;
    },
    [tokens]
  );

  // Function to toggle the `isShow` property of a token by address
  const toggleTokenVisibility = useCallback(
    async (address: string) => {
      const token = getTokenByAddress(address);
      if (token) {
        updateToken(address, { isShow: !token.isShow });
      }
    },
    [getTokenByAddress, updateToken]
  );

  // Function to clear all tokens
  const clearTokens = useCallback(async () => {
    setTokens([]);
  }, [setTokens]);

  return {
    tokens,
    addToken,
    updateToken,
    removeToken,
    getTokenByAddress,
    toggleTokenVisibility,
    clearTokens
  };
};
