import { useEffect, useState } from 'react';
import Countdown from 'react-countdown';
import { useTranslation } from 'react-i18next';

import { PriceData } from 'buy/hooks';
import styles from './SpecialOffer.module.scss';
import { LineChart } from '../LineChart';

interface SpecialOfferProps {
  tokenPrice: number | null;
  tokenPaySymbol: string;
  tokenBuySymbol?: string;
  priceData?: PriceData;
  onCountdownComplete: () => void;
}

export const SpecialOffer: React.FC<SpecialOfferProps> = ({
  tokenPrice,
  tokenPaySymbol,
  tokenBuySymbol,
  priceData,
  onCountdownComplete
}) => {
  const { t } = useTranslation();
  const [offerEndTime, setOfferEndTime] = useState<number | null>(null);

  useEffect(() => {
    if (priceData?.offerAvailable && !offerEndTime) {
      setOfferEndTime(Date.now() + priceData.offerAvailable * 1000);
    }
  }, [priceData?.offerAvailable, offerEndTime]);

  return priceData?.isDiscountExist ? (
    <>
      <div className={styles.specialOffer}>
        <div className={styles.specialOffer__tittle}>{t('heyThere')}</div>
        <div className={styles.specialOffer__text}>
          {t('specialPersonalOffer')}
        </div>
        <div className={styles.specialOffer__price}>
          {tokenPrice && tokenPaySymbol
            ? `${tokenPrice} ${tokenPaySymbol}`
            : t('loading')}
        </div>
        <div className={styles.specialOffer__subtitle}>{t('tokenPrice')}</div>
        <div className={styles.specialOffer__timeLeft}>
          {offerEndTime ? (
            <Countdown date={offerEndTime} onComplete={onCountdownComplete} />
          ) : (
            t('loading')
          )}
        </div>
        <div className={styles.specialOffer__subtitle}>
          {t('offerAvailable')}
        </div>
        <div className={styles.specialOffer__allocation}>
          {priceData?.availableAllocation && tokenBuySymbol
            ? `${Number(priceData.availableAllocation).toFixed(
                0
              )} ${tokenBuySymbol}`
            : t('loading')}
        </div>
        <div className={styles.specialOffer__subtitle}>
          {t('availableAllocation')}
        </div>
        <div className={styles.specialOffer__tip}>
          {t('discountedTokensPromo')}
        </div>
      </div>
      <LineChart data={priceData?.data ? priceData.data : []} />
    </>
  ) : (
    <>
      <div className={styles.specialOffer}>
        <div className={styles.specialOffer__price}>
          {tokenPrice && tokenPaySymbol
            ? `${tokenPrice} ${tokenPaySymbol}`
            : t('loading')}
        </div>
        <div className={styles.specialOffer__subtitle}>{t('tokenPrice')}</div>
      </div>
    </>
  );
};
