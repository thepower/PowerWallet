import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { TToken } from 'myAssets/types';

export interface Wallet {
  chainId: number;
  address: string;
  encryptedWif: string;
}

export const localStorageRootPath = 'thepowereco/PowerWallet';

// export const useWallets = () => {
//   const [wallets, setWallets] = useLocalStorage<Wallet[]>(
//     `${localStorageRootPath}/wallets`,
//     []
//   );
//   const [activeAddress, setActiveAddress] = useLocalStorage<string | null>(
//     `${localStorageRootPath}/activeAddress`,
//     null
//   );

//   // Функция для проверки уникальности адреса
//   const isAddressUnique = useCallback(
//     (address: string): boolean => {
//       return !wallets.some((wallet) => wallet.address === address);
//     },
//     [wallets]
//   );

//   // Функция для добавления нового кошелька
//   const addWallet = useCallback(
//     async (newWallet: Wallet) => {
//       if (!isAddressUnique(newWallet.address)) {
//         return;
//       }

//       const updatedWallets = [...wallets, newWallet];
//       setWallets(updatedWallets);

//       setActiveAddress(newWallet.address);
//     },
//     [isAddressUnique, setActiveAddress, setWallets, wallets]
//   );

//   // Функция для обновления кошелька по адресу
//   const updateWallet = useCallback(
//     async (address: string, updatedData: Partial<Wallet>) => {
//       const updatedWallets = wallets.map((wallet) =>
//         wallet.address === address ? { ...wallet, ...updatedData } : wallet
//       );
//       setWallets(updatedWallets);
//     },
//     [setWallets, wallets]
//   );

//   // Функция для удаления кошелька по адресу
//   const removeWallet = useCallback(
//     async (address: string) => {
//       const updatedWallets = wallets.filter(
//         (wallet) => wallet.address !== address
//       );
//       setWallets(updatedWallets);

//       if (activeAddress === address) {
//         const newActiveAddress =
//           updatedWallets.length > 0 ? updatedWallets[0].address : null;
//         setActiveAddress(newActiveAddress);
//       }
//     },
//     [wallets, setWallets, activeAddress, setActiveAddress]
//   );

//   // Функция для получения кошелька по адресу
//   const getWalletByAddress = useCallback(
//     (address: string) => {
//       return wallets.find((wallet) => wallet.address === address) || null;
//     },
//     [wallets]
//   );

//   // Вычисляем активный кошелек
//   const activeWallet = useMemo(() => {
//     return activeAddress ? getWalletByAddress(activeAddress) : null;
//   }, [activeAddress, getWalletByAddress]);

//   // Функция для установки активного кошелька
//   const setActiveWalletByAddress = useCallback(
//     (address: string) => {
//       if (getWalletByAddress(address)) {
//         setActiveAddress(address);
//       }
//     },
//     [getWalletByAddress, setActiveAddress]
//   );

//   // Очистка всех кошельков
//   const clearWallets = useCallback(async () => {
//     setWallets([]);
//     setActiveAddress(null);
//   }, [setActiveAddress, setWallets]);

//   return {
//     wallets,
//     activeWallet,
//     addWallet,
//     updateWallet,
//     removeWallet,
//     getWalletByAddress,
//     setActiveWalletByAddress,
//     clearWallets
//   };
// };

interface WalletStore {
  wallets: Wallet[];
  activeWallet: Wallet | null;
  addWallet: (newWallet: Wallet) => void;
  updateWallet: (address: string, updatedData: Partial<Wallet>) => void;
  removeWallet: (address: string) => void;
  setActiveWalletByAddress: (address: string) => void;
  clearWallets: () => void;
}

export const useWalletsStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      wallets: [],
      activeWallet: null,

      addWallet: (newWallet: Wallet) => {
        const { wallets } = get();
        if (
          !!get().wallets.some((wallet) => wallet.address === newWallet.address)
        ) {
          return;
        }

        set({ wallets: [...wallets, newWallet] });
        set({ activeWallet: newWallet });
      },

      updateWallet: (address: string, updatedData: Partial<Wallet>) => {
        set((state) => ({
          wallets: state.wallets.map((wallet) =>
            wallet.address === address ? { ...wallet, ...updatedData } : wallet
          ),
          activeWallet: state.activeWallet
            ? state.activeWallet.address === address
              ? { ...state.activeWallet, ...updatedData }
              : state.activeWallet
            : null
        }));
      },

      removeWallet: (address: string) => {
        set((state) => {
          const updatedWallets = state.wallets.filter(
            (wallet) => wallet.address !== address
          );
          return {
            wallets: updatedWallets,
            activeWallet: updatedWallets.length > 0 ? updatedWallets[0] : null
          };
        });
      },

      setActiveWalletByAddress: (address: string) => {
        const wallet =
          get().wallets.find((wallet) => wallet.address === address) || null;
        if (wallet) {
          set({ activeWallet: wallet });
        }
      },

      clearWallets: () => {
        set({ wallets: [], activeWallet: null });
      }
    }),
    {
      name: `${localStorageRootPath}/wallets`
    }
  )
);

// export const useTokens = () => {
//   const [tokens, setTokens] = useLocalStorage<TToken[]>(
//     `${localStorageRootPath}/tokens`,
//     []
//   );

//   // Function to check if a token address is unique
//   const isAddressUnique = useCallback(
//     (address: string): boolean => {
//       return !tokens.some((token) => token.address === address);
//     },
//     [tokens]
//   );

//   // Function to add a new token
//   const addToken = useCallback(
//     async (newToken: TToken) => {
//       if (!isAddressUnique(newToken.address)) {
//         return;
//       }

//       const updatedTokens = [...tokens, newToken];
//       setTokens(updatedTokens);
//     },
//     [isAddressUnique, setTokens, tokens]
//   );

//   // Function to update a token by address
//   const updateToken = useCallback(
//     async (address: string, updatedData: Partial<TToken>) => {
//       const updatedTokens = tokens.map((token) =>
//         token.address === address ? { ...token, ...updatedData } : token
//       );
//       setTokens(updatedTokens);
//     },
//     [setTokens, tokens]
//   );

//   // Function to remove a token by address
//   const removeToken = useCallback(
//     async (address: string) => {
//       const updatedTokens = tokens.filter((token) => token.address !== address);
//       setTokens(updatedTokens);
//     },
//     [setTokens, tokens]
//   );

//   // Function to get a token by address
//   const getTokenByAddress = useCallback(
//     (address?: string) => {
//       return tokens.find((token) => token.address === address) || null;
//     },
//     [tokens]
//   );

//   // Function to toggle the `isShow` property of a token by address
//   const toggleTokenVisibility = useCallback(
//     async (address: string) => {
//       const token = getTokenByAddress(address);
//       if (token) {
//         updateToken(address, { isShow: !token.isShow });
//       }
//     },
//     [getTokenByAddress, updateToken]
//   );

//   // Function to clear all tokens
//   const clearTokens = useCallback(async () => {
//     setTokens([]);
//   }, [setTokens]);

//   return {
//     tokens,
//     addToken,
//     updateToken,
//     removeToken,
//     getTokenByAddress,
//     toggleTokenVisibility,
//     clearTokens
//   };
// };

interface TokenStore {
  tokens: TToken[];
  addToken: (newToken: TToken) => void;
  updateToken: (address: string, updatedData: Partial<TToken>) => void;
  removeToken: (address: string) => void;
  getTokenByAddress: (address?: string) => TToken | null;
  toggleTokenVisibility: (address: string) => void;
  isAddressUnique: (address: string) => boolean;
  clearTokens: () => void;
}

export const useTokensStore = create<TokenStore>()(
  persist(
    (set, get) => ({
      tokens: [],

      isAddressUnique: (address: string): boolean => {
        return !get().tokens.some((token) => token.address === address);
      },

      addToken: (newToken: TToken) => {
        const { tokens, isAddressUnique } = get();
        if (!isAddressUnique(newToken.address)) {
          return;
        }
        set({ tokens: [...tokens, newToken] });
      },

      updateToken: (address: string, updatedData: Partial<TToken>) => {
        set((state) => ({
          tokens: state.tokens.map((token) =>
            token.address === address ? { ...token, ...updatedData } : token
          )
        }));
      },

      removeToken: (address: string) => {
        set((state) => ({
          tokens: state.tokens.filter((token) => token.address !== address)
        }));
      },

      getTokenByAddress: (address?: string) => {
        const { tokens } = get();
        return tokens.find((token) => token.address === address) || null;
      },

      toggleTokenVisibility: (address: string) => {
        const token = get().getTokenByAddress(address);
        if (token) {
          get().updateToken(address, { isShow: !token.isShow });
        }
      },

      clearTokens: () => {
        set({ tokens: [] });
      }
    }),
    {
      name: `${localStorageRootPath}/tokens` // название ключа в localStorage
    }
  )
);
