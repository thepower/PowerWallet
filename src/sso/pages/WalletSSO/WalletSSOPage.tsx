import { FC, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { AppQueryParams, WalletRoutesEnum } from 'application/typings/routes';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { Button } from 'common';
import { objectToString, stringToObject } from 'sso/utils';

import styles from './WalletSSOPage.module.scss';

const WalletSSOPageComponent: FC = () => {
  const { data } = useParams<{ data: string }>();
  const { wallets, setActiveWalletByAddress } = useWalletsStore();

  const parsedData = useMemo<AppQueryParams>(() => {
    try {
      return data ? stringToObject(data) : null;
    } catch (error) {
      return null;
    }
  }, [data]);

  useEffect(() => {
    // if (!wallets?.length) {
    //   navigate(WalletRoutesEnum.signup);
    // }
    // else {
    //   const stringData = objectToString({
    //     address: activeWallet.address,
    //     returnUrl: parsedData?.returnUrl
    //   });
    //   if (parsedData?.callbackUrl) {
    //     window.location.replace(`${parsedData.callbackUrl}sso/${stringData}`);
    //   }
    // }
  });

  const onClickLoginHandler = useCallback(
    (walletAddress: string) => {
      if (parsedData?.callbackUrl) {
        const stringData = objectToString({
          address: walletAddress,
          returnUrl: parsedData?.returnUrl
        });
        setActiveWalletByAddress(walletAddress);
        window.location.replace(`${parsedData.callbackUrl}sso/${stringData}`);
      }
    },
    [parsedData?.callbackUrl, parsedData?.returnUrl, setActiveWalletByAddress]
  );

  const isWalletWithRequiredChainExists = useMemo<boolean>(() => {
    return wallets.some((wallet) => wallet.chainId === parsedData?.chainID);
  }, [parsedData?.chainID, wallets]);

  const content = useMemo(() => {
    if (!wallets?.length) {
      return (
        <>
          У вас ваще нету кошельков
          <Button variant='contained' to={`${WalletRoutesEnum.login}/${data}`}>
            Login
          </Button>
          <Button variant='contained' to={`${WalletRoutesEnum.signup}/${data}`}>
            Create wallet {parsedData?.chainID}
          </Button>
        </>
      );
    } else {
      if (isWalletWithRequiredChainExists) {
        const filteredWalletsByChain = wallets.filter(
          (wallet) => wallet.chainId === parsedData?.chainID
        );

        return (
          <>
            Выберите кошелек для чейна {parsedData?.chainID}
            {filteredWalletsByChain.map((wallet) => (
              <Button
                key={wallet.address}
                variant='contained'
                onClick={() => onClickLoginHandler(wallet.address)}
              >
                {wallet.address}
              </Button>
            ))}
          </>
        );
      } else {
        return (
          <>
            У вас нету кошелька для чейна {parsedData?.chainID}
            <Button
              variant='contained'
              to={`${WalletRoutesEnum.login}/${data}`}
            >
              Login
            </Button>
            <Button
              variant='contained'
              to={`${WalletRoutesEnum.signup}/${data}`}
            >
              Create wallet {parsedData?.chainID}
            </Button>
          </>
        );
      }
    }
  }, [
    data,
    isWalletWithRequiredChainExists,
    onClickLoginHandler,
    parsedData?.chainID,
    wallets
  ]);

  return <div className={styles.walletSSOPage}>{content}</div>;
};

export const WalletSSOPage = WalletSSOPageComponent;
