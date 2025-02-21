import React from 'react';
import { CryptoApi } from '@thepowereco/tssdk';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { useConfirmModalPromise } from 'application/hooks';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { NodeNftSvg } from 'assets/icons';
import { Button, FullScreenLoader, PageTemplate } from 'common';
import styles from './ClaimNodePage.module.scss';
import { useClaimNode } from '../hooks/useClaimNode';
import { useClaimNodeStatus } from '../hooks/useClaimNodeStatus';

export const ClaimNodePage: React.FC = () => {
  const { t } = useTranslation();
  const { activeWallet } = useWalletsStore();
  const { claimNode, isClaimPending } = useClaimNode();
  const { data: claimStatus, isLoading } = useClaimNodeStatus();
  const { confirm } = useConfirmModalPromise();

  const handleClaim = async () => {
    try {
      if (!activeWallet) {
        throw new Error('Wallet not found');
      }
      const decryptedWif = CryptoApi.decryptWif(activeWallet.encryptedWif, '');
      await claimNode({ wif: decryptedWif });
    } catch (err) {
      const decryptedWif = await confirm();
      if (decryptedWif) {
        await claimNode({ wif: decryptedWif });
      }
    }
  };

  if (isLoading) {
    return <FullScreenLoader />;
  }

  const availableNodes =
    (claimStatus?.eligibleAmount || 0) - (claimStatus?.claimedAmount || 0);

  return (
    <PageTemplate
      topBarChild={t('claimNode')}
      backUrl='/'
      backUrlText={t('home')!}
    >
      <div className={styles.container}>
        <div className={styles.nodeIntro}>
          <h1 className={styles.title}>{t('powerNode')}</h1>
          <p className={styles.subtitle}>{t('powerNodeSubtitle')}</p>
          <p className={styles.description}>
            {t('powerNodeOperationDescription')}
          </p>
          <div className={styles.nftSection}>
            <NodeNftSvg className={styles.nftImage} />
            <div className={styles.info}>
              <div
                className={cn(
                  styles.statusBadge,
                  claimStatus?.isEligible && claimStatus?.isAvailable
                    ? styles.statusReady
                    : styles.statusNotReady
                )}
              >
                {claimStatus?.isEligible && claimStatus?.isAvailable
                  ? t('readyToMint')
                  : t('notAvailable')}
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>{t('nodesAvailable')}</span>
                  <span
                    className={`${styles.value} ${
                      claimStatus?.isAvailable
                        ? styles.valueSuccess
                        : styles.valueError
                    }`}
                  >
                    {claimStatus?.isAvailable ? t('yes') : t('no')}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>{t('yourEligibility')}</span>
                  <span
                    className={`${styles.value} ${
                      claimStatus?.isEligible
                        ? styles.valueSuccess
                        : styles.valueError
                    }`}
                  >
                    {claimStatus?.isEligible ? t('yes') : t('no')}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>{t('availableForClaim')}</span>
                  <span className={styles.value}>{availableNodes}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>{t('alreadyClaimed')}</span>
                  <span className={styles.value}>
                    {claimStatus?.claimedAmount}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.stakeInfo}>
              <span className={styles.stakeLabel}>{t('stake')}:</span>
              <span className={styles.stakeValue}>25,000 $SK</span>
              <span className={styles.stakeLocked}>{t('lockedIntoNFT')}</span>
            </div>
            {!claimStatus?.isEligible ||
              !claimStatus?.isAvailable ||
              availableNodes <= 0 || (
                <Button
                  loading={isClaimPending}
                  variant='contained'
                  onClick={handleClaim}
                >
                  {isClaimPending ? t('claiming') : t('claimPowerNodeNFT')}
                </Button>
              )}
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};
