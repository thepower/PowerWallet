import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { FormControlLabel } from '@mui/material';
import { AddressApi, CryptoApi } from '@thepowereco/tssdk';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useExportAccount } from 'account/hooks';
import { useStore } from 'application/store';
import { WalletRoutesEnum } from 'application/typings/routes';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import {
  Button,
  Checkbox,
  CopyButton,
  OutlinedInput,
  WizardComponentProps
} from 'common';
import { useCreateWallet } from 'registration/hooks/useCreateWallet';
import { BackupAccountStepsEnum } from 'registration/typings/registrationTypes';
import { compareTwoStrings } from 'registration/utils/registrationUtils';
import styles from './Backup.module.scss';

type BackupProps = WizardComponentProps;

const BackupComponent: FC<BackupProps> = ({ setNextStep }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [passwordsNotEqual, setPasswordsNotEqual] = useState(false);

  const [isSeedPhraseSaved, setIsSeedPhraseSaved] = useState(false);
  const navigate = useNavigate();
  const {
    selectedChain,
    seedPhrase,
    backupStep,
    isWithoutPassword,
    setBackupStep,
    setSeedPhrase
  } = useStore();
  const { dataOrReferrer } = useParams<{ dataOrReferrer?: string }>();
  const { activeWallet } = useWalletsStore();

  const { exportAccountMutation } = useExportAccount();
  const { createWalletMutation, isLoading: isWalletCreating } =
    useCreateWallet();
  const isAddressInParams = useMemo(
    () => dataOrReferrer && AddressApi.isTextAddressValid(dataOrReferrer),
    [dataOrReferrer]
  );

  useEffect(() => {
    if (!seedPhrase) {
      const phrase: string = CryptoApi.generateSeedPhrase();

      setSeedPhrase(phrase);
    }
  }, [seedPhrase]);

  const onClickNext = useCallback(() => {
    if (backupStep === BackupAccountStepsEnum.generateSeedPhrase) {
      setBackupStep(BackupAccountStepsEnum.encryptPrivateKey);
    } else if (backupStep === BackupAccountStepsEnum.encryptPrivateKey) {
      const passwordsNotEqual = compareTwoStrings(password, confirmedPassword);

      if (!passwordsNotEqual && !isWithoutPassword) {
        setPasswordsNotEqual(true);
        return;
      }
      if (seedPhrase) {
        createWalletMutation({
          seedPhrase,
          password: isWithoutPassword ? '' : password,
          referrer: isAddressInParams ? dataOrReferrer : ''
        });
      }
    }
  }, [
    backupStep,
    setBackupStep,
    password,
    confirmedPassword,
    isWithoutPassword,
    seedPhrase,
    createWalletMutation,
    isAddressInParams,
    dataOrReferrer
  ]);

  const renderSeedPhrase = useCallback(() => {
    if (seedPhrase) {
      const words = seedPhrase.split(' ');
      return (
        <div className={styles.seedPhrase}>
          {words.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </div>
      );
    }
    return null;
  }, [seedPhrase]);

  const onClickCheckbox = useCallback(() => {
    setIsSeedPhraseSaved(!isSeedPhraseSaved);
  }, [isSeedPhraseSaved]);

  const renderCheckBox = useCallback(
    () => (
      <FormControlLabel
        control={
          <Checkbox
            size={'medium'}
            checked={isSeedPhraseSaved}
            onClick={onClickCheckbox}
            disableRipple
          />
        }
        className={styles.checkBoxLabel}
        label={t('ISavedMySeedPhrase')}
      />
    ),
    [isSeedPhraseSaved, onClickCheckbox, t]
  );

  const renderGenerateSeedPhrase = useCallback(
    () => (
      <>
        <div className={styles.title}>
          {t('writeDownYourSeedPhraseAndStore')}
        </div>
        {renderSeedPhrase()}
        {seedPhrase && (
          <CopyButton
            className={styles.copyButton}
            iconClassName={styles.copyIcon}
            textButton={t('copySeedPhrase')}
            copyInfo={seedPhrase}
          />
        )}
        {renderCheckBox()}
        <div className={styles.tip}>{t('seedPhraseIsTheOnlyWay')}</div>
        <Button
          className={styles.button}
          variant='contained'
          size='large'
          onClick={onClickNext}
          disabled={!isSeedPhraseSaved}
        >
          {t('next')}
        </Button>
      </>
    ),
    [
      t,
      seedPhrase,
      isSeedPhraseSaved,
      onClickNext,
      renderSeedPhrase,
      renderCheckBox
    ]
  );

  const onChangePassword = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setPassword(event.target.value);
    setPasswordsNotEqual(false);
  };

  const onChangeConfirmedPassword = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setConfirmedPassword(event.target.value);
    setPasswordsNotEqual(false);
  };

  const renderEncryptPrivateKey = useCallback(
    () => (
      <>
        <div className={styles.title}>{t('enterPasswordEncryptYour')}</div>
        <div className={styles.passwordForm}>
          <OutlinedInput
            id='password'
            name='password'
            placeholder={t('password')!}
            className={styles.passwordInput}
            value={password}
            onChange={onChangePassword}
            autoComplete='new-password'
            size='small'
            type={'password'}
            disabled={isWalletCreating || isWithoutPassword}
          />
          <OutlinedInput
            id='confirmedPassword'
            name='confirmedPassword'
            placeholder={t('repeatPassword')!}
            className={styles.passwordInput}
            value={confirmedPassword}
            onChange={onChangeConfirmedPassword}
            type={'password'}
            error={passwordsNotEqual}
            autoComplete='new-password'
            size='small'
            errorMessage={t('oopsPasswordsDidntMatch')!}
            disabled={isWalletCreating || isWithoutPassword}
          />
          <Button
            className={styles.button}
            variant='contained'
            size='large'
            onClick={onClickNext}
            loading={isWalletCreating}
            disabled={passwordsNotEqual || (!password && !isWithoutPassword)}
          >
            {t('next')}
          </Button>
        </div>
      </>
    ),
    [
      confirmedPassword,
      isWalletCreating,
      isWithoutPassword,
      onClickNext,
      password,
      passwordsNotEqual,
      t
    ]
  );

  const onClickExportAccount = useCallback(() => {
    exportAccountMutation({
      password,
      isWithoutGoHome: true,
      additionalActionOnSuccess: () => {
        if (dataOrReferrer && !isAddressInParams) {
          setNextStep();
        } else {
          navigate(WalletRoutesEnum.root);
        }
      }
    });
  }, [
    dataOrReferrer,
    exportAccountMutation,
    isAddressInParams,
    navigate,
    password,
    setNextStep
  ]);

  const renderRegistrationCompleted = useCallback(() => {
    const fileName = selectedChain
      ? `power_wallet_${selectedChain}_${activeWallet?.address}.pem`
      : `power_wallet_${activeWallet?.address}.pem`;

    return (
      <div className={styles.registrationCompleted}>
        <div className={styles.title}>
          {t('congratulations')}
          <br />
          {t('registrationCompleted')}
        </div>
        <div className={styles.label}>{t('yourAccountNumber')}</div>
        <div className={styles.text}>{activeWallet?.address}</div>
        <div className={styles.label}>{t('yourSeedPhrase')}</div>
        <div className={styles.text}>{seedPhrase}</div>
        <div className={styles.instruction}>
          {t('toLogInItIsMoreConvenient')}
        </div>
        <div className={styles.instruction}>
          <b>{t('yourKeyFileWillBeSavedToDisk')}</b>
          <br />
          {fileName}
        </div>
        <Button
          className={styles.button}
          variant='contained'
          size='large'
          onClick={onClickExportAccount}
          disabled={passwordsNotEqual}
        >
          {t('exportAccount')}
        </Button>
      </div>
    );
  }, [
    seedPhrase,
    onClickExportAccount,
    passwordsNotEqual,
    selectedChain,
    activeWallet,
    t
  ]);

  const renderContent = useCallback(() => {
    switch (backupStep) {
      case BackupAccountStepsEnum.generateSeedPhrase:
        return renderGenerateSeedPhrase();
      case BackupAccountStepsEnum.encryptPrivateKey:
        return renderEncryptPrivateKey();
      case BackupAccountStepsEnum.registrationCompleted:
        return renderRegistrationCompleted();
      default:
        return null;
    }
  }, [
    renderEncryptPrivateKey,
    renderGenerateSeedPhrase,
    renderRegistrationCompleted,
    backupStep
  ]);

  return <div className={styles.content}>{renderContent()}</div>;
};

export const Backup = BackupComponent;
