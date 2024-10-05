import { create, Mutate, StoreApi } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { TToken } from 'myAssets/types';

export interface Wallet {
  name: string;
  chainId: number;
  address: string;
  encryptedWif: string;
}

export const localStorageRootPath = 'thepowereco/PowerWallet';

interface WalletStore {
  wallets: Wallet[];
  activeWallet: Wallet | null;
  addWallet: (newWallet: Wallet) => void;
  updateWallet: (address: string, updatedData: Partial<Wallet>) => void;
  removeWallet: (address: string) => void;
  setActiveWalletByAddress: (address: string) => void;
  clearWallets: () => void;
}

type StoreWithPersist<T> = Mutate<StoreApi<T>, [['zustand/persist', unknown]]>;

export const withStorageDOMEvents = <T>(store: StoreWithPersist<T>) => {
  const storageEventCallback = (e: StorageEvent) => {
    if (e.key === store.persist.getOptions().name && e.newValue) {
      console.log(1);
      store.persist.rehydrate();
    }
  };
  window.addEventListener('storage', storageEventCallback);
  return () => {
    window.removeEventListener('storage', storageEventCallback);
  };
};

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
      name: `${localStorageRootPath}/wallets`,
      storage: createJSONStorage(() => localStorage)
    }
  )
);

withStorageDOMEvents(useWalletsStore);

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
      name: `${localStorageRootPath}/tokens`,
      storage: createJSONStorage(() => localStorage)
    }
  )
);

withStorageDOMEvents(useTokensStore);
