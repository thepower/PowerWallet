import {
  PageTemplate, Tabs,
} from 'common';

import React, {
  FC, useState,
} from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { RootState } from 'application/store';

import { ReferralSystemTabs, getReferralSystemTabsLabels } from 'referral-system/types';
import styles from './ReferralSystemPage.module.scss';

const mapDispatchToProps = {

};

const mapStateToProps = (state: RootState) => ({

});

const connector = connect(mapStateToProps, mapDispatchToProps);

type ReferralSystemPageProps = ConnectedProps<typeof connector>;

const ReferralSystemPageComponent: FC<ReferralSystemPageProps> = () => {
  const { t } = useTranslation();

  const [tab, setTab] = useState('referralLink');

  const onChangeTab = (_event: React.SyntheticEvent, value: string) => {
    setTab(value);
  };

  return (
    <PageTemplate
      backUrl="/"
      backUrlText={t('home')!}
    >
      <div className={styles.wrapper}>
        <div className={styles.firstBlock}>
          <div className={styles.title}>Invite Friends, Earn Rewards!</div>
          <div className={styles.subtitle}>Welcome to Power Wallet Referral Program! </div>
          <div className={styles.text}>Help us grow our community and earn rewards for both you and your friends</div>
        </div>
        <div className={styles.title}>My Friends: 18</div>
        <Tabs
          tabs={ReferralSystemTabs}
          tabsLabels={getReferralSystemTabsLabels(t)}
          value={tab}
          onChange={onChangeTab}
          tabsRootClassName={styles.addAssetsPageTabsRoot}
        />
      </div>

    </PageTemplate>
  );
};

export const ReferralSystemPage = connector(ReferralSystemPageComponent);
