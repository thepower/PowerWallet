import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { AppQueryParams, RoutesEnum } from 'application/typings/routes';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { Button } from 'common';
import { objectToString, stringToObject } from 'sso/utils';
import styles from './SSOPage.module.scss';

export const SSOPage: FC = () => {
  const { data } = useParams<{ data: string }>();
  const { wallets, setActiveWalletByAddress } = useWalletsStore();
  const { t } = useTranslation();

  const parsedData = useMemo<AppQueryParams | null>(() => {
    try {
      return data ? stringToObject(data) : null;
    } catch {
      return null;
    }
  }, [data]);

  const chainID = parsedData?.chainID;

  const walletsWithChain = wallets.filter(
    (wallet) => wallet.chainId === chainID
  );
  const isWalletWithRequiredChainExists = walletsWithChain.length > 0;

  const onClickLoginHandler = useCallback(
    (walletAddress: string) => {
      if (parsedData?.callbackUrl) {
        const stringData = objectToString({
          address: walletAddress,
          returnUrl: parsedData.returnUrl
        });
        setActiveWalletByAddress(walletAddress);
        window.opener.postMessage?.(
          objectToString({
            type: 'authenticateResponse',
            data: stringData
          }),
          parsedData.returnUrl
        );
        window.close();
      }
    },
    [parsedData, setActiveWalletByAddress]
  );

  const handleWindowResize = useCallback(() => {
    window.moveTo(0, 0);
    window.resizeTo(screen.width, screen.height);
  }, []);

  const truncate = (str: string, maxLength: number) =>
    str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;

  const renderContent = useMemo(() => {
    if (!wallets?.length) {
      return (
        <div className={styles.buttons}>
          <Button
            variant='contained'
            onClick={handleWindowResize}
            to={`${RoutesEnum.signup}/${data}`}
          >
            {t('createPowerWallet')}
          </Button>
          <Button
            variant='outlined'
            onClick={handleWindowResize}
            to={`${RoutesEnum.login}/${data}`}
          >
            {t('login')}
          </Button>
        </div>
      );
    } else if (isWalletWithRequiredChainExists) {
      return (
        <>
          <div className={styles.subtitle}>{t('pleaseSelectAccount')}</div>
          <div className={styles.walletList}>
            {walletsWithChain.map((wallet) => (
              <div
                className={styles.walletCard}
                key={wallet.address}
                onClick={() => onClickLoginHandler(wallet.address)}
              >
                <div title={wallet.name} className={styles.name}>
                  {truncate(wallet.name, 20)}
                </div>
                <div className={styles.address}>{wallet.address}</div>
                <div className={styles.chain}>
                  {t('chain')}: {wallet.chainId}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className={styles.subtitle}>
            {t('youDontHaveWalletForChain', { chainID })}
          </div>
          <div className={styles.buttons}>
            <Button
              variant='contained'
              onClick={handleWindowResize}
              to={`${RoutesEnum.signup}/${data}`}
            >
              {t('createPowerWallet')}
            </Button>
            <Button
              variant='outlined'
              onClick={handleWindowResize}
              to={`${RoutesEnum.login}/${data}`}
            >
              {t('login')}
            </Button>
          </div>
        </>
      );
    }
  }, [
    wallets,
    walletsWithChain,
    isWalletWithRequiredChainExists,
    data,
    t,
    chainID,
    onClickLoginHandler,
    handleWindowResize
  ]);

  return (
    <div className={styles.walletSSOPage}>
      <div className={styles.title}>{t('walletAuthorization')}</div>
      {renderContent}
    </div>
  );
};
