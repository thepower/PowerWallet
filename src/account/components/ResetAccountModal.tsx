import { FC } from 'react';
import { Button } from '@mui/material';
import classnames from 'classnames';
import { FormikHelpers, useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useResetWallet } from 'account/hooks';
import { Modal, OutlinedInput } from 'common';
import styles from 'registration/components/pages/registration/RegistrationPage.module.scss';

const initialValues = { password: '' };
type Values = typeof initialValues;

type ResetAccountModalProps = {
  open: boolean;
  onClose: () => void;
};

const ResetAccountModalComponent: FC<ResetAccountModalProps> = ({
  onClose,
  open
}) => {
  const { t } = useTranslation();
  const { resetWallet } = useResetWallet();
  const handleSubmitImportModal = async (
    values: Values,
    formikHelpers: FormikHelpers<Values>
  ) => {
    const { password } = values;

    resetWallet({ password });

    formikHelpers.setFieldValue('password', '');
    onClose();
  };

  const formik = useFormik({
    initialValues,
    onSubmit: handleSubmitImportModal
  });

  return (
    <Modal
      contentClassName={styles.importModalContent}
      onClose={onClose}
      open={open}
    >
      <div className={styles.exportModalTitleHolder}>
        <div className={styles.exportModalTitle}>{t('resetAccount')}</div>
        <div className={styles.exportModalTitle}>
          {t('areYouSureYouWantResetYourAccount')}
        </div>
        <div className={styles.exportModalTitle}>
          {t('enterYourPasswordConfirmAccountReset')}
        </div>
      </div>
      <form className={styles.resetModalForm} onSubmit={formik.handleSubmit}>
        <OutlinedInput
          inputRef={(input) => input && input.focus()}
          placeholder={t('password')!}
          type={'password'}
          autoComplete='new-password'
          autoFocus
          size='small'
          errorMessage={formik.errors.password}
          error={formik.touched.password && Boolean(formik.errors.password)}
          {...formik.getFieldProps('password')}
        />
        <Button
          className={classnames(
            styles.registrationNextButton,
            styles.registrationNextButton_outlined
          )}
          variant='outlined'
          size='large'
          type='submit'
          disabled={!formik.isValid || formik.isSubmitting}
        >
          <span className={styles.registrationNextButtonText}>
            {t('confirm')}
          </span>
        </Button>
      </form>
    </Modal>
  );
};

export const ResetAccountModal = ResetAccountModalComponent;
