import { useCallback, useEffect, useMemo, useState } from 'react';
import localForage from 'localforage';

type ApplicationStorageKeyType = 'address' | 'wif' | 'test';

const applicationStorage = localForage.createInstance({
  driver: localForage.LOCALSTORAGE,
  name: 'thepowereco',
  version: 1.0
});

export const getKeyFromApplicationStorage = <T>(
  key: ApplicationStorageKeyType
) => applicationStorage.getItem<T>(key);
export const setKeyToApplicationStorage = (
  key: ApplicationStorageKeyType,
  value: any
) => applicationStorage.setItem(key, value);
export const clearApplicationStorage = async () => {
  // await applicationStorage.removeItem('tokens');
  await applicationStorage.removeItem('address');
  await applicationStorage.removeItem('wif');
};

interface Wallet {
  chainId: number;
  address: string;
  encryptedWif: string;
}

export const useWallets = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных из localForage при монтировании компонента
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const storedWallets =
        await applicationStorage.getItem<Wallet[]>('wallets');
      const storedActiveAddress =
        await applicationStorage.getItem<string>('activeAddress');

      setWallets(storedWallets || []);
      setActiveAddress(storedActiveAddress ?? null);
      setError(null);
    } catch (err) {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Синхронизация состояния с другими вкладками
  useEffect(() => {
    const handleStorageChange = () => {
      fetchData();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchData]);

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
      setLoading(true);
      try {
        if (!isAddressUnique(newWallet.address)) {
          setError('Wallet with this address already exists.');
          return;
        }

        const updatedWallets = [...wallets, newWallet];
        setWallets(updatedWallets);
        await applicationStorage.setItem('wallets', updatedWallets);

        if (activeAddress === null) {
          setActiveAddress(newWallet.address);
          await applicationStorage.setItem('activeAddress', newWallet.address);
        }
        setError(null);
      } catch (err) {
        setError('Failed to add wallet.');
      } finally {
        setLoading(false);
      }
    },
    [isAddressUnique, wallets, activeAddress]
  );

  // Функция для обновления кошелька по адресу
  const updateWallet = useCallback(
    async (address: string, updatedData: Partial<Wallet>) => {
      setLoading(true);
      try {
        const updatedWallets = wallets.map((wallet) =>
          wallet.address === address ? { ...wallet, ...updatedData } : wallet
        );
        setWallets(updatedWallets);
        await applicationStorage.setItem('wallets', updatedWallets);
        setError(null);
      } catch (err) {
        setError('Failed to update wallet.');
      } finally {
        setLoading(false);
      }
    },
    [wallets]
  );

  // Функция для удаления кошелька по адресу
  const removeWallet = useCallback(
    async (address: string) => {
      setLoading(true);
      try {
        const updatedWallets = wallets.filter(
          (wallet) => wallet.address !== address
        );
        setWallets(updatedWallets);
        await applicationStorage.setItem('wallets', updatedWallets);

        if (activeAddress === address) {
          const newActiveAddress =
            updatedWallets.length > 0 ? updatedWallets[0].address : null;
          setActiveAddress(newActiveAddress);
          await applicationStorage.setItem('activeAddress', newActiveAddress);
        }
        setError(null);
      } catch (err) {
        setError('Failed to remove wallet.');
      } finally {
        setLoading(false);
      }
    },
    [wallets, activeAddress]
  );

  // Функция для получения кошелька по адресу
  const getWalletByAddress = useCallback(
    (address: string): Wallet | undefined => {
      return wallets.find((wallet) => wallet.address === address);
    },
    [wallets]
  );

  // Вычисляем активный кошелек
  const activeWallet = useMemo(() => {
    return activeAddress ? getWalletByAddress(activeAddress) : null;
  }, [activeAddress, getWalletByAddress]);

  // Функция для установки активного кошелька
  const setActiveWalletByAddress = useCallback(
    async (address: string) => {
      setLoading(true);
      try {
        if (getWalletByAddress(address)) {
          setActiveAddress(address);
          await applicationStorage.setItem('activeAddress', address);
          setError(null);
        } else {
          setError('Wallet not found.');
        }
      } catch (err) {
        setError('Failed to set active wallet.');
      } finally {
        setLoading(false);
      }
    },
    [getWalletByAddress]
  );

  // Очистка всех кошельков
  const clearWallets = useCallback(async () => {
    setLoading(true);
    try {
      setWallets([]);
      setActiveAddress(null);
      await applicationStorage.removeItem('wallets');
      await applicationStorage.removeItem('activeAddress');
      setError(null);
    } catch (err) {
      setError('Failed to clear wallets.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    wallets,
    activeWallet,
    loading,
    error,
    addWallet,
    updateWallet,
    removeWallet,
    getWalletByAddress,
    setActiveWalletByAddress,
    clearWallets
  };
};
