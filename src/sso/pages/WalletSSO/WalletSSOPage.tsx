import React, { FC, useCallback, useMemo } from 'react';
import { useParams } from 'react-router';
import { AppQueryParams, WalletRoutesEnum } from 'application/typings/routes';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { Button } from 'common';
import { objectToString, stringToObject } from 'sso/utils';
import styles from './WalletSSOPage.module.scss';

const WalletSSOPageComponent: FC = () => {
  const { data } = useParams<{ data: string }>();
  const { wallets, setActiveWalletByAddress } = useWalletsStore();

  const parsedData = useMemo<AppQueryParams | null>(() => {
    try {
      return data ? stringToObject(data) : null;
    } catch (error) {
      return null;
    }
  }, [data]);

  const onClickLoginHandler = useCallback(
    (walletAddress: string) => {
      if (parsedData?.callbackUrl) {
        const stringData = objectToString({
          address: walletAddress,
          returnUrl: parsedData.returnUrl
        });
        setActiveWalletByAddress(walletAddress);
        window.location.replace(`${parsedData.callbackUrl}sso/${stringData}`);
      }
    },
    [parsedData, setActiveWalletByAddress]
  );

  const isWalletWithRequiredChainExists = useMemo(
    () => wallets.some((wallet) => wallet.chainId === parsedData?.chainID),
    [parsedData?.chainID, wallets]
  );

  const renderNoWallets = () => (
    <>
      <p>У вас вообще нету кошельков</p>
      <Button variant='contained' to={`${WalletRoutesEnum.login}/${data}`}>
        Login
      </Button>
      <Button variant='contained' to={`${WalletRoutesEnum.signup}/${data}`}>
        Create wallet {parsedData?.chainID}
      </Button>
    </>
  );

  const renderWalletSelection = () => {
    const filteredWalletsByChain = wallets.filter(
      (wallet) => wallet.chainId === parsedData?.chainID
    );

    return (
      <>
        <p>Выберите кошелек для чейна {parsedData?.chainID}</p>
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
  };

  const renderNoWalletForChain = () => (
    <>
      <p>У вас нету кошелька для чейна {parsedData?.chainID}</p>
      <Button variant='contained' to={`${WalletRoutesEnum.login}/${data}`}>
        Login
      </Button>
      <Button variant='contained' to={`${WalletRoutesEnum.signup}/${data}`}>
        Create wallet {parsedData?.chainID}
      </Button>
    </>
  );

  const content = useMemo(() => {
    if (!wallets?.length) {
      return renderNoWallets();
    } else if (isWalletWithRequiredChainExists) {
      return renderWalletSelection();
    } else {
      return renderNoWalletForChain();
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
