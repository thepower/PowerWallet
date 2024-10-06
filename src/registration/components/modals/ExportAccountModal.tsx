import React, { useEffect } from 'react';
import { Button } from '@mui/material';
import classnames from 'classnames';
import { FormikHelpers, useFormik } from 'formik';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useExportAccount } from 'account/hooks';
import { Modal, OutlinedInput } from '../../../common';
import styles from '../pages/registration/RegistrationPage.module.scss';

const initialValues = {
  password: '',
  confirmedPassword: '',
  hint: ''
};

type Values = typeof initialValues;

type ExportAccountModalProps = {
  open: boolean;
  onClose: () => void;
};

const validationSchema = (t: TFunction) =>
  yup.object().shape({
    password: yup.string().required(t('required')),
    confirmedPassword: yup
      .string()
      .required(t('required'))
      .oneOf([yup.ref('password'), null], t('oopsPasswordsDidntMatch'))
  });

const ExportAccountModalComponent: React.FC<ExportAccountModalProps> = ({
  open,
  onClose
}) => {
  const { t } = useTranslation();

  const { exportAccountMutation } = useExportAccount();

  const handleSubmitExportModal = async (
    { password, hint }: Values,
    formikHelpers: FormikHelpers<Values>
  ) => {
    exportAccountMutation({
      password,
      hint,
      additionalActionOnSuccess: () => {
        formikHelpers.resetForm();

        onClose();
      }
    });
  };

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmedPassword: '',
      hint: ''
    },
    onSubmit: handleSubmitExportModal,
    validationSchema: validationSchema(t),
    validateOnBlur: false
  });

  useEffect(() => {
    formik.resetForm();
  }, []);

  return (
    <Modal
      contentClassName={styles.exportModalContent}
      onClose={onClose}
      open={open}
    >
      <div className={styles.exportModalTitleHolder}>
        <div className={styles.exportModalTitle}>{t('exportWallet')}</div>
        <div className={styles.exportModalTitle}>{t('exportYourWallet')}</div>
        <div className={styles.exportModalTitle}>
          {t('exportFileEncrypted')}
        </div>
      </div>
      <form className={styles.exportModalForm} onSubmit={formik.handleSubmit}>
        <OutlinedInput
          size='small'
          placeholder={t('password')}
          error={formik.touched.password && Boolean(formik.errors.password)}
          errorMessage={formik.errors.password}
          type='password'
          autoFocus
          fullWidth
          {...formik.getFieldProps('password')}
        />
        <OutlinedInput
          size='small'
          placeholder={t('repeatedPassword')}
          error={
            formik.touched.confirmedPassword &&
            Boolean(formik.errors.confirmedPassword)
          }
          fullWidth
          errorMessage={formik.errors.confirmedPassword}
          type='password'
          {...formik.getFieldProps('confirmedPassword')}
        />
        <OutlinedInput
          size='small'
          placeholder={t('hint')}
          fullWidth
          {...formik.getFieldProps('hint')}
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

export const ExportAccountModal = ExportAccountModalComponent;
