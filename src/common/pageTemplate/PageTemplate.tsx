import React, { PropsWithChildren } from 'react';
import Account from 'account/components/Account';
import i18n from 'locales/initTranslation';
import styles from './PageTemplate.module.scss';
import { TopBar } from '../index';

interface PageTemplateProps {
  topBarChild?: React.ReactNode;
  backUrl?: string;
  backUrlText?: string;
}

const PageTemplate: React.FC<PropsWithChildren<PageTemplateProps>> = ({
  children,
  topBarChild,
  backUrl,
  backUrlText = i18n.t('back')!
}) => (
  <div className={styles.template}>
    <Account />
    <TopBar backUrl={backUrl} backUrlText={backUrlText}>
      {topBarChild}
    </TopBar>
    {children}
  </div>
);

export default PageTemplate;
