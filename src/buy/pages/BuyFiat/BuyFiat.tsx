// import { createHmac } from 'crypto';
import React, { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { PageTemplate, Select } from 'common';
import styles from './BuyFiat.module.scss';

enum Token {
  WSK = 'WSK',
  TOY = 'TOY',
  USDCoy = 'USDCoy',
  USDtoy18 = 'USDtoy18'
}

type TokenOption = {
  title: Token;
  value: Token;
};

const tokens: TokenOption[] = [
  {
    title: Token.USDtoy18,
    value: Token.USDtoy18
  },
  {
    title: Token.USDCoy,
    value: Token.USDCoy
  },
  {
    title: Token.WSK,
    value: Token.WSK
  }
];

const css = new URL('./widget.css', import.meta.url).toString();

const partner_token = '';
const itez_secret = '';

const params: { [key: string]: any } = {
  partner_token: partner_token,
  target_element: 'widget-container',
  timestamp: Date.now(),
  // from_currency: 'USD',
  to_currency: 'TRC20USDT',
  partner_css: css
};

const jsonToString = (obj: object) => {
  return Object.entries(obj)
    .sort()
    .map((items) => `${items[0]}:${items[1]}`)
    .join(';');
};

function signHmacSha512(obj: object, secret: string) {
  // return createHmac('sha512', secret).update(jsonToString(obj)).digest('hex');
}

// Make signature
params.signature = signHmacSha512(params, itez_secret);

const WidgetComponent = () => {
  useEffect(() => {
    const iframe = document.querySelector<HTMLIFrameElement>('.widget-iframe');

    const runItezWidget = () => {
      try {
        if (window.ItezWidget) {
          iframe?.style.setProperty('--primaryFill', 'red');
          console.log({ iframe });
          window.ItezWidget.run(params, 'POST');
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
  }, []);

  return (
    <>
      <div id={params.target_element}></div>{' '}
    </>
  );
};

export const BuyFiatPage: React.FC = () => {
  const [token, setToken] = React.useState<Token>(Token.WSK);

  const { t } = useTranslation();

  return (
    <PageTemplate
      backUrl='/'
      backUrlText={t('home')!}
      topBarChild={t('deposit')}
    >
      <div className={styles.buyPage}>
        <Select
          size='small'
          id='tokenSelect'
          label={t('token')}
          items={tokens}
          value={token}
          onChange={(e) => setToken(e.target.value as Token)}
        />
        <WidgetComponent />
      </div>
    </PageTemplate>
  );
};
