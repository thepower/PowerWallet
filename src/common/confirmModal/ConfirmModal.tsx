import React, { useCallback } from 'react';
import { CryptoApi } from '@thepowereco/tssdk';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';
import styles from './ConfirmModal.module.scss';
import { Button, Modal, OutlinedInput } from '..';
import { getWalletData } from '../../account/selectors/accountSelectors';
import { RootState } from '../../application/store';

interface OwnProps {
  open: boolean;
  onClose: () => void;
  callback: (decryptedWif: string) => void;
}

const initialValues = { password: '' };
type Values = typeof initialValues;

const connector = connect((state: RootState) => ({
  encryptedWif: getWalletData(state).encryptedWif
}));

type ConfirmModalProps = ConnectedProps<typeof connector> & OwnProps;

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  onClose,
  open,
  encryptedWif,
  callback
}) => {
  const { t } = useTranslation();
  const handleSubmit = useCallback(
    async (values: Values, formikHelpers: FormikHelpers<Values>) => {
      try {
        const decryptedWif = await CryptoApi.decryptWif(encryptedWif, '');
        callback(decryptedWif);
      } catch (e) {
        try {
          const decryptedWif = await CryptoApi.decryptWif(
            encryptedWif,
            values.password
          );
          callback(decryptedWif);
        } catch (error) {
          formikHelpers.setFieldError('password', t('invalidPasswordError')!);
        }
      }
    },
    [callback, t, encryptedWif]
  );

  return (
    <Modal open={open} onClose={onClose} contentClassName={styles.modalContent}>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {(formikProps) => (
          <Form className={styles.form}>
            <p className={styles.title}>{t('confirmAction')}</p>
            <p className={styles.subTitle}>
              {t('enterYourPasswordCompleteTransaction')}
            </p>
            <OutlinedInput
              inputRef={(input) => input && input.focus()}
              placeholder={t('password')!}
              className={styles.passwordInput}
              name='password'
              value={formikProps.values.password}
              onChange={formikProps.handleChange}
              onBlur={formikProps.handleBlur}
              type={'password'}
              autoComplete='new-password'
              autoFocus
              errorMessage={formikProps.errors.password}
              error={
                formikProps.touched.password &&
                Boolean(formikProps.errors.password)
              }
            />
            <Button
              variant='outlined'
              type='submit'
              disabled={!formikProps.dirty}
              className={styles.button}
            >
              {t('confirm')}
            </Button>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default connector(ConfirmModal);
