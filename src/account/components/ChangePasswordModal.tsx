import { FC, useState } from 'react';
import { Button, FormControlLabel } from '@mui/material';
import classnames from 'classnames';
import { FormikHelpers, useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useChangePassword } from 'account/hooks';
import { Modal, OutlinedInput, Checkbox } from 'common';
import styles from 'registration/components/pages/registration/RegistrationPage.module.scss';

const initialValues = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
};

type Values = typeof initialValues;

type ChangePasswordModalProps = {
  open: boolean;
  onClose: () => void;
};

const getValidationSchema = (t: (key: string) => string) =>
  Yup.object().shape({
    oldPassword: Yup.string(),
    newPassword: Yup.string().when('isWithoutPassword', {
      is: false,
      then: (schema) =>
        schema.required('Required').min(8, t('passwordMinLength')),
      otherwise: (schema) => schema
    }),
    confirmPassword: Yup.string().when('isWithoutPassword', {
      is: false,
      then: (schema) =>
        schema
          .required('Required')
          .oneOf([Yup.ref('newPassword')], t('passwordsMustMatch')),
      otherwise: (schema) => schema
    })
  });

const ChangePasswordModalComponent: FC<ChangePasswordModalProps> = ({
  onClose,
  open
}) => {
  const { t } = useTranslation();
  const { changePassword } = useChangePassword();
  const [isWithoutPassword, setIsWithoutPassword] = useState(false);
  const [hasOldPassword, setHasOldPassword] = useState(true);

  const handleSubmit = async (
    values: Values,
    formikHelpers: FormikHelpers<Values>
  ) => {
    const { oldPassword, newPassword } = values;

    await changePassword({
      oldPassword: hasOldPassword ? oldPassword : '',
      newPassword,
      isWithoutPassword,
      additionalActionOnSuccess: () => {
        formikHelpers.resetForm();
        onClose();
      }
    });
  };

  const formik = useFormik({
    initialValues,
    validationSchema: getValidationSchema(t),
    onSubmit: handleSubmit
  });

  return (
    <Modal
      contentClassName={styles.importModalContent}
      onClose={onClose}
      open={open}
    >
      <div className={styles.exportModalTitleHolder}>
        <div className={styles.exportModalTitle}>{t('changePassword')}</div>
      </div>
      <form className={styles.resetModalForm} onSubmit={formik.handleSubmit}>
        <FormControlLabel
          control={
            <Checkbox
              size='medium'
              checked={!hasOldPassword}
              onClick={() => setHasOldPassword(!hasOldPassword)}
              disableRipple
            />
          }
          className={styles.checkBoxLabel}
          label={t('noOldPassword')}
        />

        {hasOldPassword && (
          <OutlinedInput
            inputRef={(input) => input && input.focus()}
            placeholder={t('oldPassword')!}
            type='password'
            autoComplete='current-password'
            size='small'
            fullWidth
            autoFocus
            errorMessage={formik.errors.oldPassword}
            error={
              formik.touched.oldPassword && Boolean(formik.errors.oldPassword)
            }
            {...formik.getFieldProps('oldPassword')}
          />
        )}

        {!isWithoutPassword && (
          <>
            <OutlinedInput
              placeholder={t('newPassword')!}
              type='password'
              autoComplete='new-password'
              size='small'
              fullWidth
              errorMessage={formik.errors.newPassword}
              error={
                formik.touched.newPassword && Boolean(formik.errors.newPassword)
              }
              {...formik.getFieldProps('newPassword')}
            />
            <OutlinedInput
              placeholder={t('confirmPassword')!}
              type='password'
              autoComplete='new-password'
              size='small'
              fullWidth
              errorMessage={formik.errors.confirmPassword}
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
              {...formik.getFieldProps('confirmPassword')}
            />
          </>
        )}
        <FormControlLabel
          control={
            <Checkbox
              size='medium'
              checked={isWithoutPassword}
              onClick={() => setIsWithoutPassword(!isWithoutPassword)}
              disableRipple
            />
          }
          className={styles.checkBoxLabel}
          label={t('IDontWantUsePassword')}
        />
        <Button
          className={classnames(
            styles.registrationNextButton,
            styles.registrationNextButton_outlined
          )}
          variant='outlined'
          size='large'
          type='submit'
          disabled={!formik.isValid || formik.isSubmitting || !formik.dirty}
        >
          <span className={styles.registrationNextButtonText}>
            {t('confirm')}
          </span>
        </Button>
      </form>
    </Modal>
  );
};

export const ChangePasswordModal = ChangePasswordModalComponent;
