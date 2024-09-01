import React from 'react';
import { Button } from '@mui/material';
import { useStore } from '@tanstack/react-store';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { setIsShowUnderConstruction, store } from 'application/store';
import styles from './underConstruction.module.scss';
import { WalletRoutesEnum } from '../../application/typings/routes';
import { Modal } from '../modal/Modal';

const UnderConstructionComponent: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isShowUnderConstruction } = useStore(store);

  const handleCloseModal = React.useCallback(() => {
    setIsShowUnderConstruction(false);
  }, []);

  const handleProceedToHome = React.useCallback(() => {
    navigate(WalletRoutesEnum.root);
    handleCloseModal();
  }, [handleCloseModal, navigate]);

  return (
    <Modal
      contentClassName={styles.underConstructionContent}
      onClose={handleCloseModal}
      open={isShowUnderConstruction}
      className={styles.underConstruction}
      alwaysShowCloseIcon
    >
      <div className={styles.underConstructionTitleHolder}>
        <div className={styles.underConstructionTitle}>{t('goodJob')}</div>
        <div className={styles.underConstructionTitle}>
          {t('thisFeatureIsCurrentlyUnderConstruction')}
        </div>
        <div className={styles.underConstructionTitle}>
          {t('thankYouImportantToUs')}
        </div>
      </div>
      <Button
        className={styles.toHomeButton}
        variant='contained'
        size='large'
        onClick={handleProceedToHome}
      >
        {t('toHome')}
      </Button>
    </Modal>
  );
};

export const UnderConstruction = UnderConstructionComponent;
