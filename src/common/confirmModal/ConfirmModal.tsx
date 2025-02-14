import React, { useCallback } from 'react';
import { CryptoApi } from '@thepowereco/tssdk';
import { FormikHelpers, useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useStore } from 'application/store';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import styles from './ConfirmModal.module.scss';
import { Button, Modal, OutlinedInput } from '..';

const initialValues = { password: '' };
type Values = typeof initialValues;

const ConfirmModal: React.FC = () => {
  const { activeWallet } = useWalletsStore();
  const {
    confirmModal,
    closeConfirmModal,
    resolveConfirmModal,
    rejectConfirmModal
  } = useStore();
  const { t } = useTranslation();

  const handleSubmit = useCallback(
    async (values: Values, formikHelpers: FormikHelpers<Values>) => {
      try {
        if (!activeWallet) {
          throw new Error('Wallet not found');
        }
        const decryptedWif = CryptoApi.decryptWif(
          activeWallet.encryptedWif,
          ''
        );
        resolveConfirmModal(decryptedWif);
      } catch (e) {
        try {
          if (!activeWallet) {
            throw new Error('Wallet not found');
          }
          const decryptedWif = CryptoApi.decryptWif(
            activeWallet.encryptedWif,
            values.password
          );
          resolveConfirmModal(decryptedWif);
        } catch (error) {
          rejectConfirmModal(error);
          formikHelpers.setFieldError('password', t('invalidPasswordError')!);
        }
      }
    },
    [activeWallet, rejectConfirmModal, resolveConfirmModal, t]
  );

  const formik = useFormik({
    initialValues,
    onSubmit: handleSubmit
  });

  return (
    <Modal
      open={confirmModal.isOpen}
      onClose={closeConfirmModal}
      contentClassName={styles.modalContent}
    >
      <form className={styles.form} onSubmit={formik.handleSubmit}>
        <p className={styles.title}>{t('confirmAction')}</p>
        <p className={styles.subTitle}>
          {t('enterYourPasswordCompleteTransaction')}
        </p>
        <OutlinedInput
          inputRef={(input) => input && input.focus()}
          placeholder={t('password')!}
          type='password'
          autoComplete='new-password'
          autoFocus
          errorMessage={formik.errors.password}
          error={formik.touched.password && Boolean(formik.errors.password)}
          {...formik.getFieldProps('password')}
        />
        <Button
          variant='outlined'
          type='submit'
          className={styles.button}
          disabled={!formik.isValid || formik.isSubmitting || !formik.dirty}
        >
          {t('confirm')}
        </Button>
      </form>
    </Modal>
  );
};

export default ConfirmModal;
