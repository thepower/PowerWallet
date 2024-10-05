import { FC } from 'react';
import { Button } from '@mui/material';
import classnames from 'classnames';
import { FormikHelpers, useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { Modal, OutlinedInput } from 'common';
import styles from 'registration/components/pages/registration/RegistrationPage.module.scss';

const initialValues = { name: '' };
type Values = typeof initialValues;

type RenameAccountModalProps = {
  open: boolean;
  onClose: () => void;
};

const RenameAccountModalComponent: FC<RenameAccountModalProps> = ({
  onClose,
  open
}) => {
  const { t } = useTranslation();
  const { activeWallet, updateWallet } = useWalletsStore();
  const handleSubmitImportModal = async (
    values: Values,
    formikHelpers: FormikHelpers<Values>
  ) => {
    const { name } = values;
    if (!activeWallet) {
      return toast.error('Wallet not found');
    }
    if (!activeWallet) {
      return toast.error('Wallet not found');
    }
    updateWallet(activeWallet.address, { name });

    formikHelpers.setFieldValue('name', '');
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
      <form className={styles.resetModalForm} onSubmit={formik.handleSubmit}>
        <div className={styles.exportModalTitleHolder}>
          <div className={styles.exportModalTitle}>{t('enterNewName')}</div>
        </div>
        <OutlinedInput
          inputRef={(input) => input && input.focus()}
          placeholder={t('name')!}
          name='name'
          size='small'
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          autoFocus
          errorMessage={formik.errors.name}
          error={formik.touched.name && Boolean(formik.errors.name)}
        />
        <Button
          className={classnames(
            styles.registrationNextButton,
            styles.registrationNextButton_outlined
          )}
          variant='outlined'
          size='large'
          type='submit'
          disabled={!formik.values.name}
        >
          <span className={styles.registrationNextButtonText}>
            {t('confirm')}
          </span>
        </Button>
      </form>
    </Modal>
  );
};

export const RenameAccountModal = RenameAccountModalComponent;
