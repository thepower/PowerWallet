import React, { useState } from 'react';
import { Button } from '@mui/material';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useExportAccount } from 'account/hooks';
import { Modal, OutlinedInput } from '../../../common';
import { compareTwoStrings } from '../../utils/registrationUtils';
import styles from '../pages/registration/RegistrationPage.module.scss';

type ExportAccountModalProps = {
  open: boolean;
  onClose: () => void;
};

const ExportAccountModalComponent: React.FC<ExportAccountModalProps> = ({
  open,
  onClose
}) => {
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [hint, setHint] = useState('');
  const [passwordsNotEqual, setPasswordsNotEqual] = useState(false);
  const { t } = useTranslation();

  const { exportAccountMutation } = useExportAccount();

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setPasswordsNotEqual(false);
  };

  const handleChangeConfirmedPassword = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmedPassword(event.target.value);
    setPasswordsNotEqual(false);
  };

  const handleChangeHint = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHint(event.target.value);
  };

  const handleSubmitExportModal = async () => {
    const passwordsNotEqual = !compareTwoStrings(password, confirmedPassword);

    if (passwordsNotEqual) {
      setPasswordsNotEqual(true);
      return;
    }

    exportAccountMutation({
      password,
      hint,
      additionalActionOnSuccess: () => {
        setPassword('');
        setConfirmedPassword('');
        setHint('');
        setPasswordsNotEqual(false);

        onClose();
      }
    });
  };

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
      <OutlinedInput
        placeholder={t('password')}
        className={classnames(styles.passwordInput, styles.passwordInputPadded)}
        value={password}
        onChange={handleChangePassword}
        type='password'
        autoFocus
      />
      <OutlinedInput
        placeholder={t('repeatedPassword')}
        className={styles.passwordInput}
        value={confirmedPassword}
        onChange={handleChangeConfirmedPassword}
        error={passwordsNotEqual}
        errorMessage={t('oopsPasswordsDidntMatch')}
        type='password'
      />
      <div className={styles.exportModalHintDesc}>{t('hintForPassword')}</div>
      <OutlinedInput
        placeholder={t('hint')}
        className={styles.exportModalHintTextArea}
        value={hint}
        onChange={handleChangeHint}
        multiline
      />
      <Button
        className={classnames(
          styles.registrationNextButton,
          styles.registrationNextButton_outlined
        )}
        variant='outlined'
        size='large'
        onClick={handleSubmitExportModal}
      >
        <span className={styles.registrationNextButtonText}>{t('next')}</span>
      </Button>
    </Modal>
  );
};

export const ExportAccountModal = ExportAccountModalComponent;
