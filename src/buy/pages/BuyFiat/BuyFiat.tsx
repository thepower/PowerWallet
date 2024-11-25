import React, { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import appEnvs from 'appEnvs';
import { useCreateNewOrder } from 'buy/hooks';
import { PageTemplate } from 'common';
import styles from './BuyFiat.module.scss';

const css = new URL('./widget.css', import.meta.url).toString();

const params: { [key: string]: any } = {
  partner_token: appEnvs.ITEZ_PARTNER_TOKEN,
  target_element: 'widget-container',
  timestamp: Date.now()
};

if (import.meta.env.MODE !== 'dev') {
  params.partner_css = css;
}

// Make signature

const WidgetComponent = () => {
  const { signedOrder } = useCreateNewOrder(params);

  useEffect(() => {
    if (signedOrder) {
      const runItezWidget = () => {
        try {
          const sparams = Object.assign(params, signedOrder);

          if (window.ItezWidget) {
            window.ItezWidget.run(sparams, 'POST');
          } else {
            console.error('ItezWidget не загружен');
          }
        } catch (error) {
          console.error(error);
        }
      };

      if (document.readyState === 'complete') {
        runItezWidget();
      } else {
        window.onload = runItezWidget;
      }
    }
  }, [signedOrder]);

  return (
    <>
      <div id={params.target_element} />
    </>
  );
};

export const BuyFiatPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PageTemplate
      backUrl='/'
      backUrlText={t('home')!}
      topBarChild={t('deposit')}
    >
      <div className={styles.buyPage}>
        <WidgetComponent />
      </div>
    </PageTemplate>
  );
};
