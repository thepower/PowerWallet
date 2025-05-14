import { useCallback, useEffect, useRef } from 'react';
import appEnvs from 'appEnvs';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { useNetworkApi } from './useNetworkApi';

const OLD_ADDRESS_KEY = 'thepowereco/address';
const OLD_WIF_KEY = 'thepowereco/wif';
const MIGRATION_COMPLETED_KEY = 'thepowereco/migration-completed';

export const useRestoreOldVersionAccount = () => {
  const isMigratingRef = useRef(false);
  const mounted = useRef(true);
  const { addWallet, wallets } = useWalletsStore();
  const { networkApi } = useNetworkApi({ chainId: appEnvs.DEFAULT_CHAIN_ID });

  const isMigrationCompleted = useCallback((address: string) => {
    try {
      const completedMigrations = JSON.parse(
        localStorage.getItem(MIGRATION_COMPLETED_KEY) || '[]'
      );
      return completedMigrations.includes(address);
    } catch (error) {
      console.error('Error checking migration flag:', error);
      return false;
    }
  }, []);

  const setMigrationCompleted = useCallback((address: string) => {
    try {
      const completedMigrations = JSON.parse(
        localStorage.getItem(MIGRATION_COMPLETED_KEY) || '[]'
      );
      if (!completedMigrations.includes(address)) {
        completedMigrations.push(address);
        localStorage.setItem(
          MIGRATION_COMPLETED_KEY,
          JSON.stringify(completedMigrations)
        );
      }
    } catch (error) {
      console.error('Error setting migration flag:', error);
    }
  }, []);

  const retrieveOldKeys = useCallback(() => {
    try {
      const address = localStorage.getItem(OLD_ADDRESS_KEY);
      const wif = localStorage.getItem(OLD_WIF_KEY);

      if (!address || !wif) {
        return { address: null, wif: null };
      }

      return {
        address: JSON.parse(address),
        wif: JSON.parse(wif)
      };
    } catch (error) {
      console.error('Error parsing old wallet keys:', error);
      return { address: null, wif: null };
    }
  }, []);

  const migrateWallet = useCallback(
    async (address: string, wif: string) => {
      if (!mounted.current) return;

      try {
        isMigratingRef.current = true;

        const result = await networkApi?.getAddressChain(address);
        if (!mounted.current) return;

        if (!result?.chain) {
          throw new Error('Failed to retrieve chain for address: ' + address);
        }

        addWallet({
          name: `wallet ${wallets.length + 1}`,
          chainId: result.chain,
          address,
          encryptedWif: wif
        });

        console.log('Wallet migrated successfully');
        setMigrationCompleted(address);
      } catch (error) {
        console.error('Error during wallet migration:', error);
        if (mounted.current) {
          isMigratingRef.current = false;
        }
        throw error;
      } finally {
        if (mounted.current) {
          isMigratingRef.current = false;
        }
      }
    },
    [networkApi, addWallet, wallets, setMigrationCompleted]
  );

  const restoreOldVersionAccount = useCallback(async () => {
    if (isMigratingRef.current || !mounted.current) return;

    const { address, wif } = retrieveOldKeys();

    if (!networkApi || !address || !wif) return;

    const isWalletExist = wallets.some((wallet) => wallet.address === address);
    const isAlreadyMigrated = isMigrationCompleted(address);

    if (isWalletExist || isAlreadyMigrated) {
      return;
    }

    try {
      await migrateWallet(address, wif);
    } catch (error) {
      // Error already logged in migrateWallet
    }
  }, [
    networkApi,
    wallets,
    migrateWallet,
    retrieveOldKeys,
    isMigrationCompleted
  ]);

  useEffect(() => {
    mounted.current = true;
    restoreOldVersionAccount();

    return () => {
      mounted.current = false;
    };
  }, [restoreOldVersionAccount]);

  return {
    isMigrating: isMigratingRef.current
  };
};
