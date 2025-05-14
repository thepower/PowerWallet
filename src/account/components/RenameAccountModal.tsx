import { FC, useEffect } from 'react';
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

  useEffect(() => {
    if (activeWallet?.name) formik.setFieldValue('name', activeWallet.name);
  }, [activeWallet]);

  return (
    <Modal
      contentClassName={styles.importModalContent}
      onClose={onClose}
      open={open}
    >
      <div className={styles.exportModalTitleHolder}>
        <div className={styles.exportModalTitle}>{t('enterNewName')}</div>
      </div>
      <form className={styles.resetModalForm} onSubmit={formik.handleSubmit}>
        <OutlinedInput
          inputRef={(input) => input && input.focus()}
          placeholder={t('name')!}
          size='small'
          autoFocus
          fullWidth
          errorMessage={formik.errors.name}
          error={formik.touched.name && Boolean(formik.errors.name)}
          {...formik.getFieldProps('name')}
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

export const RenameAccountModal = RenameAccountModalComponent;
