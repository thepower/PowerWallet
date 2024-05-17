import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';
import {
  createWallet,
  generateSeedPhrase,
} from 'registration/slice/registrationSlice';
import {
  getGeneratedSeedPhrase,
  getSelectedChain,
} from 'registration/selectors/registrationSelectors';
import { RootState } from 'application/store';
import {
  Button,
  Checkbox,
  CopyButton,
  OutlinedInput,
  WizardComponentProps,
} from 'common';
import { FormControlLabel } from '@mui/material';
import { compareTwoStrings } from 'registration/utils/registrationUtils';
import { exportAccount } from 'account/slice/accountSlice';
import { checkIfLoading } from 'network/selectors';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import styles from './Backup.module.scss';

enum Stage {
  generateSeedPhrase = 'generateSeedPhrase',
  encryptPrivateKey = 'encryptPrivateKey',
  registrationCompleted = 'registrationCompleted',
}

const mapStateToProps = (state: RootState) => ({
  generatedSeedPhrase: getGeneratedSeedPhrase(state),
  walletAddress: getWalletAddress(state),
  isCreateWalletLoading: checkIfLoading(state, createWallet.type),
  selectedChain: getSelectedChain(state),
});

const mapDispatchToProps = {
  generateSeedPhrase,
  createWallet,
  exportAccount,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type BackupProps = ConnectedProps<typeof connector> & WizardComponentProps;

const BackupComponent: FC<BackupProps> = ({
  selectedChain,
  walletAddress,
  generateSeedPhrase,
  generatedSeedPhrase,
  createWallet,
  exportAccount,
  isCreateWalletLoading,
}) => {
  const { t } = useTranslation();
  const [stage, setStage] = useState(Stage.generateSeedPhrase);
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [passwordsNotEqual, setPasswordsNotEqual] = useState(false);

  const [isSeedPhraseSaved, setIsSeedPhraseSaved] = useState(false);

  useEffect(() => {
    if (!generatedSeedPhrase) {
      generateSeedPhrase();
    }
  }, [generateSeedPhrase, generatedSeedPhrase]);

  const onClickNext = useCallback(() => {
    if (stage === Stage.generateSeedPhrase) {
      setStage(Stage.encryptPrivateKey);
    } else if (stage === Stage.encryptPrivateKey) {
      const passwordsNotEqual = compareTwoStrings(password, confirmedPassword);

      if (!passwordsNotEqual) {
        setPasswordsNotEqual(true);
        return;
      }

      createWallet({
        password,
        additionalActionOnSuccess: () => {
          setStage(Stage.registrationCompleted);
        },
      });
    }
  }, [confirmedPassword, createWallet, password, stage]);

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
        label="I saved my seed phrase"
      />
    ),
    [isSeedPhraseSaved],
  );

  const renderGenerateSeedPhrase = useCallback(
    () => (
      <>
        <div className={styles.title}>
          Write down your seed phrase and store is somewhere safe
        </div>
        {renderSeedPhrase()}
        {generatedSeedPhrase && (
          <CopyButton
            className={styles.copyButton}
            iconClassName={styles.copyIcon}
            textButton="Copy Seed Phrase"
            copyInfo={generatedSeedPhrase}
          />
        )}
        {renderCheckBox()}
        <div className={styles.tip}>
          Seed phrase is the only way to restore your private key
        </div>
        <Button
          className={styles.button}
          variant="filled"
          size="large"
          onClick={onClickNext}
          disabled={!isSeedPhraseSaved}
        >
          Next
        </Button>
      </>
    ),
    [
      generatedSeedPhrase,
      isSeedPhraseSaved,
      onClickNext,
      renderSeedPhrase,
      renderCheckBox,
    ],
  );

  const onChangePassword = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setPassword(event.target.value);
    setPasswordsNotEqual(false);
  };

  const onChangeConfirmedPassword = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setConfirmedPassword(event.target.value);
    setPasswordsNotEqual(false);
  };

  const renderEncryptPrivateKey = useCallback(
    () => (
      <>
        <div className={styles.title}>
          Enter password to encrypt your private key
        </div>
        <div className={styles.passwordForm}>
          <OutlinedInput
            id="password"
            name="password"
            placeholder={t('password')!}
            className={styles.passwordInput}
            value={password}
            onChange={onChangePassword}
            autoComplete="new-password"
            size="small"
            type={'password'}
            disabled={isCreateWalletLoading}
          />
          <OutlinedInput
            id="confirmedPassword"
            name="confirmedPassword"
            placeholder={t('repeatPassword')!}
            className={styles.passwordInput}
            value={confirmedPassword}
            onChange={onChangeConfirmedPassword}
            type={'password'}
            error={passwordsNotEqual}
            autoComplete="new-password"
            size="small"
            errorMessage={t('oopsPasswordsDidntMatch')!}
            disabled={isCreateWalletLoading}
          />
          <Button
            className={styles.button}
            variant="filled"
            size="large"
            onClick={onClickNext}
            disabled={passwordsNotEqual || isCreateWalletLoading}
          >
            Next
          </Button>
        </div>
      </>
    ),
    [
      confirmedPassword,
      isCreateWalletLoading,
      onClickNext,
      password,
      passwordsNotEqual,
      t,
    ],
  );

  const onClickExportAccount = useCallback(() => {
    exportAccount({
      password,
      isWithoutGoHome: true,
    });
  }, [exportAccount, password]);

  const renderRegistrationCompleted = useCallback(() => {
    const fileName = selectedChain
      ? `power_wallet_${selectedChain}_${walletAddress}.pem`
      : `power_wallet_${walletAddress}.pem`;

    return (
      <div className={styles.registrationCompleted}>
        <div className={styles.title}>
          Congratulations!
          <br />
          Registration is completed
        </div>
        <div className={styles.label}>Your account number:</div>
        <div className={styles.text}>{walletAddress}</div>
        <div className={styles.label}>Your seed phrase:</div>
        <div className={styles.text}>{generatedSeedPhrase}</div>
        <div className={styles.instruction}>
          To log in, it is more convenient to use a key file, but to reserve, be
          sure to write down the seed phrase and account number for an
          alternative login.
        </div>
        <div className={styles.instruction}>
          <b>Your key file will be saved to disk</b>
          <br />
          {fileName}
        </div>
        <Button
          className={styles.button}
          variant="filled"
          size="large"
          onClick={onClickExportAccount}
          disabled={passwordsNotEqual}
        >
          Export account
        </Button>
      </div>
    );
  }, [
    generatedSeedPhrase,
    onClickExportAccount,
    passwordsNotEqual,
    selectedChain,
    walletAddress,
  ]);

  const renderContent = useCallback(() => {
    switch (stage) {
      case Stage.generateSeedPhrase:
        return renderGenerateSeedPhrase();
      case Stage.encryptPrivateKey:
        return renderEncryptPrivateKey();
      case Stage.registrationCompleted:
        return renderRegistrationCompleted();
      default:
        return null;
    }
  }, [
    renderEncryptPrivateKey,
    renderGenerateSeedPhrase,
    renderRegistrationCompleted,
    stage,
  ]);

  return <div className={styles.content}>{renderContent()}</div>;
};

export const Backup = connector(BackupComponent);
