import React from 'react';

import { useTranslation } from 'react-i18next';

import appEnvs from 'appEnvs';
import { defaultEvmChain } from 'application/components/App';
import { Button, OutlinedInput, PageTemplate, Select } from 'common';
import styles from './BuyFiat.module.scss';

export const BuyFiatPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PageTemplate
      backUrl='/'
      backUrlText={t('home')!}
      topBarChild={t('deposit')}
    >
      FIAT
    </PageTemplate>
  );
};
