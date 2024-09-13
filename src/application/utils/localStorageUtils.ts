import { useCallback, useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';
// interface WalletStore {
//   wallets: Wallet[];
//   activeAddress: string | null;
//   addWallet: (newWallet: Wallet) => void;
//   updateWallet: (address: string, updatedData: Partial<Wallet>) => void;
//   removeWallet: (address: string) => void;
//   getWalletByAddress: (address: string | null) => Wallet | null;
//   setActiveWalletByAddress: (address: string | null) => void;
//   clearWallets: () => void;
//   activeWallet: Wallet | null;
// }

import { TToken } from 'myAssets/types';

export interface Wallet {
  chainId: number;
  address: string;
  encryptedWif: string;
}

export const localStorageRootPath = 'thepowereco/PowerWallet';

export const useWallets = () => {
  const [wallets, setWallets] = useLocalStorage<Wallet[]>(
    `${localStorageRootPath}/wallets`,
    []
  );
  const [activeAddress, setActiveAddress] = useLocalStorage<string | null>(
    `${localStorageRootPath}/activeAddress`,
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

// interface WalletStore {
//   wallets: Wallet[];
//   activeAddress: string | null;
//   addWallet: (newWallet: Wallet) => void;
//   updateWallet: (address: string, updatedData: Partial<Wallet>) => void;
//   removeWallet: (address: string) => void;
//   getWalletByAddress: (address: string | null) => Wallet | null;
//   setActiveWalletByAddress: (address: string | null) => void;
//   clearWallets: () => void;
//   activeWallet: Wallet | null;
// }

// export const useWalletStore = create<WalletStore>()(
//   persist(
//     (set, get) => ({
//       wallets: [],
//       activeAddress: null,

//       addWallet: (newWallet) => {
//         const { wallets, setActiveWalletByAddress } = get();
//         const isAddressUnique = !wallets.some(
//           (wallet) => wallet.address === newWallet.address
//         );

//         if (isAddressUnique) {
//           const updatedWallets = [...wallets, newWallet];
//           set({ wallets: updatedWallets });
//           setActiveWalletByAddress(newWallet.address);
//         }
//       },

//       updateWallet: (address, updatedData) => {
//         set((state) => ({
//           wallets: state.wallets.map((wallet) =>
//             wallet.address === address ? { ...wallet, ...updatedData } : wallet
//           )
//         }));
//       },

//       removeWallet: (address) => {
//         const { wallets, activeAddress, setActiveWalletByAddress } = get();
//         const updatedWallets = wallets.filter(
//           (wallet) => wallet.address !== address
//         );

//         set({ wallets: updatedWallets });

//         if (activeAddress === address) {
//           const newActiveAddress =
//             updatedWallets.length > 0 ? updatedWallets[0].address : null;
//           setActiveWalletByAddress(newActiveAddress);
//         }
//       },

//       getWalletByAddress: (address) => {
//         const { wallets } = get();
//         return wallets.find((wallet) => wallet.address === address) || null;
//       },

//       setActiveWalletByAddress: (address) => {
//         const wallet = get().getWalletByAddress(address);
//         if (wallet) {
//           set({ activeAddress: address });
//         }
//       },

//       clearWallets: () => {
//         set({ wallets: [], activeAddress: null });
//       },

//       activeWallet: null
//     }),
//     {
//       name: `${localStorageRootPath}/wallets`, // ключ в localStorage
//       onRehydrateStorage: () => (state) => {
//         // Реинициализация активного кошелька при восстановлении состояния
//         if (state?.activeAddress) {
//           state.activeWallet =
//             state.wallets.find(
//               (wallet) => wallet.address === state.activeAddress
//             ) || null;
//         }
//       }
//     }
//   )
// );

export const useTokens = () => {
  const [tokens, setTokens] = useLocalStorage<TToken[]>(
    `${localStorageRootPath}/tokens`,
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
    (address?: string) => {
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

// interface TokenStore {
//   tokens: TToken[];
//   addToken: (newToken: TToken) => void;
//   updateToken: (address: string, updatedData: Partial<TToken>) => void;
//   removeToken: (address: string) => void;
//   getTokenByAddress: (address?: string) => TToken | null;
//   toggleTokenVisibility: (address: string) => void;
//   clearTokens: () => void;
// }

// export const useTokensStore = create<TokenStore>()(
//   persist(
//     (set, get) => ({
//       tokens: [],

//       addToken: (newToken) => {
//         const { tokens } = get();
//         const isAddressUnique = !tokens.some(
//           (token) => token.address === newToken.address
//         );
//         if (isAddressUnique) {
//           set({ tokens: [...tokens, newToken] });
//         }
//       },

//       updateToken: (address, updatedData) => {
//         set((state) => ({
//           tokens: state.tokens.map((token) =>
//             token.address === address ? { ...token, ...updatedData } : token
//           )
//         }));
//       },

//       removeToken: (address) => {
//         set((state) => ({
//           tokens: state.tokens.filter((token) => token.address !== address)
//         }));
//       },

//       getTokenByAddress: (address) => {
//         const { tokens } = get();
//         return tokens.find((token) => token.address === address) || null;
//       },

//       toggleTokenVisibility: (address) => {
//         const { getTokenByAddress, updateToken } = get();
//         const token = getTokenByAddress(address);
//         if (token) {
//           updateToken(address, { isShow: !token.isShow });
//         }
//       },

//       clearTokens: () => {
//         set({ tokens: [] });
//       }
//     }),
//     {
//       name: `${localStorageRootPath}/tokens` // название ключа в localStorage
//     }
//   )
// );
