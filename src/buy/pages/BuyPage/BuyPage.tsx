import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { RoutesEnum } from 'application/typings/routes';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { CryptoSvg } from 'assets/icons';
import { CardLink, CopyButton, PageTemplate } from 'common';

import styles from './BuyPage.module.scss';

const BuyPageComponent: FC = () => {
  const { t } = useTranslation();

  const { activeWallet } = useWalletsStore();
  return (
    <PageTemplate
      backUrl='/'
      backUrlText={t('home')!}
      topBarChild={t('deposit')}
    >
      <div className={styles.buyPage}>
        <CopyButton
          textButton={activeWallet?.address || ''}
          className={styles.addressButton}
          iconClassName={styles.copyIcon}
        />
        <div className={styles.title}>{t('selectPaymentMethod')}</div>
        <div className={styles.cards}>
          <CardLink
            label={t('crypto')}
            to={`${RoutesEnum.buy}${RoutesEnum.crypto}`}
            className={styles.cardLink}
          >
            <CryptoSvg />
          </CardLink>
          {/* <CardLink
            label={t('fiat')}
            to={`${RoutesEnum.buy}${RoutesEnum.fiat}`}
            className={styles.cardLink}
          >
            <FiatSvg />
          </CardLink> */}
        </div>
      </div>
    </PageTemplate>
  );
};

export const BuyPage = BuyPageComponent;
