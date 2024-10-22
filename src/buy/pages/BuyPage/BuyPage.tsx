import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
        // evmChainId: 'exampleEvmChainId',
        // powerChainId: 'examplePowerChainId',
        // evmTokenAddress: '0xExampleTokenAddress',
        // evmBridgeAddress: '0xExampleBridgeAddress',
        // powerTokenAddress: 'examplePowerTokenAddress',
        // powerBridgeAddress: 'examplePowerBridgeAddress',
        // amount: '1000'
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
          src={`https://localhost:3000?${params}`}
          width='100%'
          height='600px'
          title='Example Iframe'
        />
      </div>
    </PageTemplate>
  );
};

export const BuyPage = BuyPageComponent;
