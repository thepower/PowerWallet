import {
  CopyButton,
  PageTemplate, Tabs,
} from 'common';

import React, {
  FC, useMemo, useState,
} from 'react';
import { ConnectedProps, connect } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { RootState } from 'application/store';

import { ReferralProgramTabs, getReferralProgramTabsLabels } from 'referral-program/types';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import styles from './ReferralProgramPage.module.scss';

const mapDispatchToProps = {

};

const mapStateToProps = (state: RootState) => ({
  walletAddress: getWalletAddress(state),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type ReferralProgramPageProps = ConnectedProps<typeof connector>;

const ReferralProgramPageComponent: FC<ReferralProgramPageProps> = ({ walletAddress }) => {
  const { t } = useTranslation();

  const [tab, setTab] = useState(ReferralProgramTabs.referralLink);

  const onChangeTab = (_event: React.SyntheticEvent, value: ReferralProgramTabs) => {
    setTab(value);
  };

  const referralLink = useMemo(() => {
    if (walletAddress) return `${window.location.origin}/${walletAddress}`;
    return '';
  }, [walletAddress]);

  return (
    <PageTemplate
      backUrl="/"
      backUrlText={t('home')!}
    >
      <div className={styles.wrapper}>
        <div className={styles.firstBlock}>
          <div className={styles.title}>{t('inviteFriendsEarnRewards')}</div>
          <div className={styles.subtitle}>{t('welcomeToPowerWalletReferral')}</div>
          <div className={styles.text}>
            {t('helpUsGrowOurCommunity')}
          </div>
        </div>
        <div className={styles.title}>
          {t('myFriends')}
          : 0
        </div>
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

export const ReferralProgramPage = connector(ReferralProgramPageComponent);
