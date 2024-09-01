import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { FormControlLabel } from '@mui/material';
import { AddressApi } from '@thepowereco/tssdk';
import { push } from 'connected-react-router';
import { useTranslation } from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useExportAccount } from 'account/hooks';
import { RootState } from 'application/reduxStore';
import { WalletRoutesEnum } from 'application/typings/routes';
import { useWallets } from 'application/utils/localStorageUtils';
import {
  Button,
  Checkbox,
  CopyButton,
  OutlinedInput,
  WizardComponentProps
} from 'common';
import { checkIfLoading } from 'network/selectors';
import {
  getCurrentBackupStep,
  getGeneratedSeedPhrase,
  getIsWithoutPassword,
  getSelectedChain
} from 'registration/selectors/registrationSelectors';
import {
  createWallet,
  generateSeedPhrase,
  setBackupStep
} from 'registration/slice/registrationSlice';
import { BackupAccountStepsEnum } from 'registration/typings/registrationTypes';
import { compareTwoStrings } from 'registration/utils/registrationUtils';
import styles from './Backup.module.scss';

const mapStateToProps = (state: RootState) => ({
  backupStep: getCurrentBackupStep(state),
  generatedSeedPhrase: getGeneratedSeedPhrase(state),
  isCreateWalletLoading: checkIfLoading(state, createWallet.type),
  selectedChain: getSelectedChain(state),
  isWithoutPassword: getIsWithoutPassword(state)
});

const mapDispatchToProps = {
  generateSeedPhrase,
  createWallet,
  // exportAccount,
  setBackupStep,
  routeTo: push
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type BackupProps = ConnectedProps<typeof connector> & WizardComponentProps;

const BackupComponent: FC<BackupProps> = ({
  backupStep,
  setBackupStep,
  selectedChain,
  generateSeedPhrase,
  generatedSeedPhrase,
  createWallet,
  isCreateWalletLoading,
  isWithoutPassword,
  setNextStep,
  routeTo
}) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [passwordsNotEqual, setPasswordsNotEqual] = useState(false);

  const [isSeedPhraseSaved, setIsSeedPhraseSaved] = useState(false);

  const { dataOrReferrer } = useParams<{ dataOrReferrer?: string }>();
  const { activeWallet } = useWallets();
  const { exportAccountMutation } = useExportAccount();

  const isAddressInParams = useMemo(
    () => dataOrReferrer && AddressApi.isTextAddressValid(dataOrReferrer),
    [dataOrReferrer]
  );

  useEffect(() => {
    if (!generatedSeedPhrase) {
      generateSeedPhrase();
    }
  }, [generateSeedPhrase, generatedSeedPhrase]);

  const onClickNext = useCallback(() => {
    if (backupStep === BackupAccountStepsEnum.generateSeedPhrase) {
      setBackupStep(BackupAccountStepsEnum.encryptPrivateKey);
    } else if (backupStep === BackupAccountStepsEnum.encryptPrivateKey) {
      const passwordsNotEqual = compareTwoStrings(password, confirmedPassword);

      if (!passwordsNotEqual && !isWithoutPassword) {
        setPasswordsNotEqual(true);
        return;
      }
      createWallet({
        password: isWithoutPassword ? '' : password,
        referrer: isAddressInParams ? dataOrReferrer : '',
        additionalActionOnSuccess: () => {
          setBackupStep(BackupAccountStepsEnum.registrationCompleted);
        }
      });
    }
  }, [
    backupStep,
    setBackupStep,
    password,
    confirmedPassword,
    isWithoutPassword,
    createWallet,
    isAddressInParams,
    dataOrReferrer
  ]);

  const renderSeedPhrase = useCallback(() => {
    if (generatedSeedPhrase) {
      const words = generatedSeedPhrase.split(' ');
      return (
        <div className={styles.seedPhrase}>
          {words.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </div>
      );
    }
    return null;
  }, [generatedSeedPhrase]);

  const onClickCheckbox = () => {
    setIsSeedPhraseSaved(!isSeedPhraseSaved);
  };

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
    [isSeedPhraseSaved, t]
  );

  const renderGenerateSeedPhrase = useCallback(
    () => (
      <>
        <div className={styles.title}>
          {t('writeDownYourSeedPhraseAndStore')}
        </div>
        {renderSeedPhrase()}
        {generatedSeedPhrase && (
          <CopyButton
            className={styles.copyButton}
            iconClassName={styles.copyIcon}
            textButton={t('copySeedPhrase')}
            copyInfo={generatedSeedPhrase}
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
      generatedSeedPhrase,
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
            disabled={isCreateWalletLoading || isWithoutPassword}
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
            disabled={isCreateWalletLoading || isWithoutPassword}
          />
          <Button
            className={styles.button}
            variant='contained'
            size='large'
            onClick={onClickNext}
            loading={isCreateWalletLoading}
            disabled={passwordsNotEqual || (!password && !isWithoutPassword)}
          >
            {t('next')}
          </Button>
        </div>
      </>
    ),
    [
      confirmedPassword,
      isCreateWalletLoading,
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
          routeTo(WalletRoutesEnum.root);
        }
      }
    });
  }, [exportAccountMutation, password]);

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
        <div className={styles.text}>{generatedSeedPhrase}</div>
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
    generatedSeedPhrase,
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

export const Backup = connector(BackupComponent);
