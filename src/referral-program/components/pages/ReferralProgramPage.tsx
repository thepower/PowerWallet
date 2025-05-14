import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useWalletsStore } from 'application/utils/localStorageUtils';
import { CopyButton, PageTemplate, Tabs } from 'common';
import {
  ReferralProgramTabs,
  getReferralProgramTabsLabels
} from 'referral-program/types';
import styles from './ReferralProgramPage.module.scss';

const ReferralProgramPageComponent: FC = () => {
  const { t } = useTranslation();

  const [tab, setTab] = useState(ReferralProgramTabs.referralLink);
  const { activeWallet } = useWalletsStore();

  const onChangeTab = (
    _event: React.SyntheticEvent,
    value: ReferralProgramTabs
  ) => {
    setTab(value);
  };

  const referralLink = useMemo(() => {
    if (activeWallet?.address)
      return `${window.location.origin}/${activeWallet.address}`;
    return '';
  }, [activeWallet]);

  return (
    <PageTemplate backUrl='/' backUrlText={t('home')!}>
      <div className={styles.wrapper}>
        <div className={styles.firstBlock}>
          <div className={styles.title}>{t('inviteFriendsEarnRewards')}</div>
          <div className={styles.subtitle}>
            {t('welcomeToPowerWalletReferral')}
          </div>
          <div className={styles.text}>{t('helpUsGrowOurCommunity')}</div>
        </div>
        {/* <div className={styles.title}>
          {t('myFriends')}
          : 0
        </div> */}
        <Tabs
          tabs={ReferralProgramTabs}
          tabsLabels={getReferralProgramTabsLabels(t)}
          value={tab}
          onChange={onChangeTab}
          tabsRootClassName={styles.addAssetsPageTabsRoot}
          tabsHolderClassName={styles.tabs}
          disabledTabs={[ReferralProgramTabs.rewards]}
        />
        <div className={styles.secondBlock}>
          <div className={styles.title}>{t('shareYourUniqueReferralLink')}</div>
          <div className={styles.text}>{t('copyAndShareThisLink')}</div>
          <div className={styles.referralLink}>{referralLink}</div>
          <CopyButton
            textButton={t('copyReferralLink')}
            className={styles.copyButton}
            iconClassName={styles.copyIcon}
            copyInfo={referralLink}
          />
        </div>
      </div>
    </PageTemplate>
  );
};

export const ReferralProgramPage = ReferralProgramPageComponent;
