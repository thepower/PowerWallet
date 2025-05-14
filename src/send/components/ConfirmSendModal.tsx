import React, { useCallback, useMemo } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { sliceString } from 'application/utils/applicationUtils';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { TToken } from 'myAssets/types';
import styles from './ConfirmSendModal.module.scss';
import { FormValues } from './SendPage';
import { Button, Modal, OutlinedInput } from '../../common';

interface OwnProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues, password: string) => Promise<void>;
  token: TToken | null;
  trxValues: {
    amount: string;
    comment: string;
    address: string;
  };
}

const initialValues = { password: '' };
type Values = typeof initialValues;

type ConfirmSendModalProps = OwnProps;

const ConfirmSendModal: React.FC<ConfirmSendModalProps> = ({
  onClose,
  open,
  trxValues,
  token,
  onSubmit
}) => {
  const { t } = useTranslation();
  const { activeWallet } = useWalletsStore();

  const from = activeWallet?.address;

  const handleSubmit = useCallback(
    async (values: Values, formikHelpers: FormikHelpers<Values>) => {
      try {
        await onSubmit(trxValues, values.password);
        onClose();
      } catch (e) {
        formikHelpers.setFieldError('password', t('invalidPasswordError')!);
      }
    },
    [onSubmit, trxValues, onClose, t]
  );

  const fields = useMemo(
    () => [
      {
        key: t('from'),
        value: from?.length && from.length > 20 ? sliceString(from, 10) : from
      },
      {
        key: t('to'),
        value:
          trxValues.address?.length && trxValues.address.length > 20
            ? sliceString(trxValues.address, 10)
            : trxValues.address
      },
      {
        key: t('amount'),
        value: `${trxValues.amount} ${token ? token.symbol : 'SK'}`
      }
    ],
    [t, from, trxValues.address, trxValues.amount, token]
  );

  return (
    <Modal open={open} onClose={onClose} contentClassName={styles.modalContent}>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {(formikProps) => (
          <Form className={styles.form}>
            <p className={styles.title}>{t('confirmTransfer')}</p>
            <p className={styles.subTitle}>
              {t('enterYourPasswordCompleteTransaction')}
            </p>
            <div className={styles.grid}>
              {fields.map(({ key, value }) => (
                <React.Fragment key={key}>
                  <span className={styles.key}>{`${key}:`}</span>
                  <span className={styles.value}>{value}</span>
                </React.Fragment>
              ))}
            </div>
            <OutlinedInput
              inputRef={(input) => input && input.focus()}
              placeholder={t('password')!}
              type={'password'}
              autoFocus
              errorMessage={formikProps.errors.password}
              error={
                formikProps.touched.password &&
                Boolean(formikProps.errors.password)
              }
              {...formikProps.getFieldProps('password')}
            />
            <Button variant='outlined' type='submit' className={styles.button}>
              {t('next')}
            </Button>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ConfirmSendModal;
