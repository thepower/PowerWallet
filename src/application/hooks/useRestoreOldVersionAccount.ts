import { useCallback, useEffect, useState } from 'react';
import appEnvs from 'appEnvs';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { useNetworkApi } from './useNetworkApi';

const OLD_ADDRESS_KEY = 'thepowereco/address';
const OLD_WIF_KEY = 'thepowereco/wif';

export const useRestoreOldVersionAccount = () => {
  const [isMigrating, setIsMigrating] = useState(false);

  const { addWallet, wallets } = useWalletsStore();
  const { networkApi } = useNetworkApi({ chainId: appEnvs.DEFAULT_CHAIN_ID });

  const restoreOldVersionAccount = useCallback(async () => {
    const address = localStorage.getItem(OLD_ADDRESS_KEY);
    const wif = localStorage.getItem(OLD_WIF_KEY);

    if (!networkApi) return;

    if (!address || !wif) return;

    const isWalletExist = wallets.some((wallet) => wallet.address === address);

    if (isWalletExist) {
      localStorage.removeItem(OLD_ADDRESS_KEY);
      localStorage.removeItem(OLD_WIF_KEY);
      return;
    }

    try {
      if (isMigrating) return;
      setIsMigrating(true);
      const jsonParsedAddress = JSON.parse(address);
      const jsonParsedWif = JSON.parse(wif);
      const result = await networkApi?.getAddressChain(jsonParsedAddress);

      if (!result?.chain) {
        console.warn(
          'Failed to retrieve chain for address:',
          jsonParsedAddress
        );
        setIsMigrating(false);
        return;
      }

      addWallet({
        name: 'wallet ' + (wallets.length + 1),
        chainId: result.chain,
        address: jsonParsedAddress,
        encryptedWif: jsonParsedWif
      });

      localStorage.removeItem(OLD_ADDRESS_KEY);
      localStorage.removeItem(OLD_WIF_KEY);

      console.log('Wallet migrated successfully');
      setIsMigrating(false);
    } catch (error) {
      setIsMigrating(false);
      console.error('Error during wallet migration:', error);
    }
  }, [addWallet, isMigrating, networkApi, wallets]);

  useEffect(() => {
    restoreOldVersionAccount();
  }, [restoreOldVersionAccount]);

  return {
    isMigrating
  };
};
