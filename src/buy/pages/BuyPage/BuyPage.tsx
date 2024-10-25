import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import appEnvs from 'appEnvs';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { PageTemplate } from 'common';

import styles from './BuyPage.module.scss';

const BuyPageComponent: FC = () => {
  const { t } = useTranslation();

  const { activeWallet } = useWalletsStore();

  const params = useMemo(() => {
    if (activeWallet) {
      // Создаем объект для параметров
      const queryParams = {
        // evmChainId: 'evmChainId',
        // powerChainId: 'powerChainId',
        // evmTokenAddress: 'evmTokenAddress',
        // evmBridgeAddress: 'evmBridgeAddress',
        // powerTokenAddress: 'powerTokenAddress',
        // powerBridgeAddress: 'powerBridgeAddress',
        toAddress: activeWallet.address
        // amount: 'amount',
        // token: 'token'
      };

      // Используем URLSearchParams для конвертации объекта в строку параметров
      return new URLSearchParams(queryParams).toString();
    }
    return '';
  }, [activeWallet]);

  return (
    <PageTemplate backUrl='/' backUrlText={t('home')!}>
      <div className={styles.wrapper}>
        <iframe
          src={`${appEnvs.BUY_THEPOWER_URL}?${params}`}
          width='100%'
          height='600px'
          title='Buy Iframe'
        />
      </div>
    </PageTemplate>
  );
};

export const BuyPage = BuyPageComponent;
