import { useCallback, useEffect, useRef } from 'react';
import appEnvs from 'appEnvs';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { useNetworkApi } from './useNetworkApi';

const OLD_ADDRESS_KEY = 'thepowereco/address';
const OLD_WIF_KEY = 'thepowereco/wif';

export const useRestoreOldVersionAccount = () => {
  const isMigratingRef = useRef(false); // Using ref to prevent simultaneous migrations
  const { addWallet, wallets } = useWalletsStore();
  const { networkApi } = useNetworkApi({ chainId: appEnvs.DEFAULT_CHAIN_ID });

  const retrieveOldKeys = () => {
    try {
      const address = localStorage.getItem(OLD_ADDRESS_KEY);
      const wif = localStorage.getItem(OLD_WIF_KEY);
      return {
        address: address ? JSON.parse(address) : null,
        wif: wif ? JSON.parse(wif) : null
      };
    } catch (error) {
      console.error('Error parsing old wallet keys:', error);
      return { address: null, wif: null };
    }
  };

  const removeOldKeys = () => {
    localStorage.removeItem(OLD_ADDRESS_KEY);
    localStorage.removeItem(OLD_WIF_KEY);
  };

  const migrateWallet = async (address: string, wif: string) => {
    try {
      isMigratingRef.current = true;

      const result = await networkApi?.getAddressChain(address);
      if (!result?.chain) {
        console.warn('Failed to retrieve chain for address:', address);
        isMigratingRef.current = false;
        return;
      }

      addWallet({
        name: `wallet ${wallets.length + 1}`,
        chainId: result.chain,
        address,
        encryptedWif: wif
      });

      console.log('Wallet migrated successfully');
      removeOldKeys();
    } catch (error) {
      console.error('Error during wallet migration:', error);
    } finally {
      isMigratingRef.current = false;
    }
  };

  const restoreOldVersionAccount = useCallback(async () => {
    if (isMigratingRef.current) return; // Prevent simultaneous migrations

    const { address, wif } = retrieveOldKeys();

    if (!networkApi || !address || !wif) return;

    const isWalletExist = wallets.some((wallet) => wallet.address === address);
    if (isWalletExist) {
      removeOldKeys();
      return;
    }

    await migrateWallet(address, wif);
  }, [networkApi, wallets, addWallet]);

  useEffect(() => {
    restoreOldVersionAccount();
  }, [restoreOldVersionAccount]);

  return {
    isMigrating: isMigratingRef.current
  };
};
