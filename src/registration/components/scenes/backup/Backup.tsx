import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { FormControlLabel } from '@mui/material';
import { AddressApi, CryptoApi } from '@thepowereco/tssdk';
import { useFormik } from 'formik';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';
import { useExportAccount } from 'account/hooks';
import { useStore } from 'application/store';
import { RoutesEnum } from 'application/typings/routes';
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
import styles from './Backup.module.scss';

const initialValues = {
  password: '',
  confirmedPassword: ''
};

type Values = typeof initialValues;

const validationSchema = (t: TFunction) =>
  yup.object().shape({
    password: yup.string().required(t('required')),
    confirmedPassword: yup
      .string()
      .required(t('required'))
      .oneOf([yup.ref('password'), null], t('oopsPasswordsDidntMatch'))
  });

type BackupProps = WizardComponentProps;

const BackupComponent: FC<BackupProps> = ({ setNextStep }) => {
  const { t } = useTranslation();

  const [isSeedPhraseSaved, setIsSeedPhraseSaved] = useState(false);
  const [usedPassword, setUsedPassword] = useState('');
  const navigate = useNavigate();
  const {
    selectedChain,
    seedPhrase,
    backupStep,
    isWithoutPassword,
    setBackupStep,
    setSeedPhrase,
    resetStore
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
    }
  }, [backupStep, setBackupStep]);

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

  const handleCreateWallet = useCallback(
    ({ password }: Values) => {
      if (backupStep === BackupAccountStepsEnum.encryptPrivateKey) {
        if (seedPhrase) {
          createWalletMutation({
            seedPhrase,
            password: isWithoutPassword ? '' : password,
            referrer: isAddressInParams ? dataOrReferrer : '',
            additionalActionOnSuccess: (password) => {
              if (password) setUsedPassword(password);
            }
          });
        }
      }
    },
    [
      backupStep,
      createWalletMutation,
      dataOrReferrer,
      isAddressInParams,
      isWithoutPassword,
      seedPhrase
    ]
  );

  const formik = useFormik({
    initialValues,
    onSubmit: handleCreateWallet,
    validationSchema: !isWithoutPassword ? validationSchema(t) : null
  });

  useEffect(() => {
    if (isWithoutPassword) {
      formik.resetForm();
    }
  }, [isWithoutPassword]);

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
      renderSeedPhrase,
      seedPhrase,
      renderCheckBox,
      onClickNext,
      isSeedPhraseSaved
    ]
  );

  useEffect(() => {
    formik.setSubmitting(isWalletCreating);
  }, [isWalletCreating]);

  const renderEncryptPrivateKey = useCallback(
    () => (
      <>
        <div className={styles.title}>{t('enterPasswordEncryptYour')}</div>
        <form onSubmit={formik.handleSubmit} className={styles.passwordForm}>
          <OutlinedInput
            placeholder={t('password')!}
            autoComplete='new-password'
            size='small'
            type={'password'}
            error={Boolean(formik.touched.password && formik.errors.password)}
            errorMessage={formik.errors.password}
            disabled={isWithoutPassword}
            {...formik.getFieldProps('password')}
          />
          <OutlinedInput
            placeholder={t('repeatPassword')!}
            type={'password'}
            autoComplete='new-password'
            size='small'
            error={Boolean(
              formik.touched.confirmedPassword &&
                formik.errors.confirmedPassword
            )}
            errorMessage={formik.errors.confirmedPassword}
            disabled={isWithoutPassword}
            {...formik.getFieldProps('confirmedPassword')}
          />
          <Button
            className={styles.button}
            variant='contained'
            size='large'
            type='submit'
            loading={isWalletCreating}
            disabled={!formik.isValid || formik.isSubmitting}
          >
            {t('next')}
          </Button>
        </form>
      </>
    ),
    [formik, isWalletCreating, isWithoutPassword, t]
  );

  const onClickExportAccount = useCallback(() => {
    exportAccountMutation({
      password: usedPassword,
      isWithoutGoHome: true,
      additionalActionOnSuccess: () => {
        if (dataOrReferrer && !isAddressInParams) {
          setNextStep();
        } else {
          navigate(RoutesEnum.root);
          resetStore();
        }
      }
    });
  }, [
    exportAccountMutation,
    usedPassword,
    dataOrReferrer,
    isAddressInParams,
    setNextStep,
    navigate,
    resetStore
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
        >
          {t('exportAccount')}
        </Button>
      </div>
    );
  }, [seedPhrase, onClickExportAccount, selectedChain, activeWallet, t]);

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
