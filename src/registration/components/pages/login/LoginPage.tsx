import React, {
  ChangeEvent, FC, useCallback, useRef, useState,
} from 'react';
import {
  useTranslation,
} from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';
import {
  Button, Checkbox, LangMenu, OutlinedInput,
} from 'common';
import { importAccountFromFile } from 'account/slice/accountSlice';
import { Maybe } from 'typings/common';
import { RegistrationCard } from 'registration/components/common/registrationCard/RegistrationCard';
import { FormControlLabel } from '@mui/material';
import { compareTwoStrings } from 'registration/utils/registrationUtils';
import { Link } from 'react-router-dom';
import { WalletRoutesEnum } from 'application/typings/routes';
import { loginToWalletFromRegistration } from '../../../slice/registrationSlice';
import registrationStyles from '../../Registration.module.scss';
import styles from './LoginPage.module.scss';

import { ImportAccountModal } from '../../modals/ImportAccountModal';

const mapStateToProps = () => ({});
const mapDispatchToProps = {
  importAccountFromFile,
  loginToWalletFromRegistration,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type LoginPageProps = ConnectedProps<typeof connector>;

const LoginPageComponent: FC<LoginPageProps> = ({
  importAccountFromFile,
  loginToWalletFromRegistration,
}) => {
  const { t } = useTranslation();

  const [openedPasswordModal, setOpenedPasswordModal] = useState(false);
  const [accountFile, setAccountFile] = useState<Maybe<File>>(null);
  const [address, setAddress] = useState('');
  const [seedOrPrivateKey, setSeedOrPrivateKey] = useState('');
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [passwordsNotEqual, setPasswordsNotEqual] = useState(false);

  const [isEnterToAccPressed, setIsEnterToAccPressed] = useState(false);
  const [isWithoutPassword, setIsWithoutPassword] = useState(false);
  const importAccountRef = useRef<HTMLInputElement>(null);

  const handleOpenImportFile = () => {
    if (importAccountRef) {
      importAccountRef.current?.click();
    }
  };

  const setAccountFileHandler = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const accountFile = event?.target?.files?.[0]!;
    importAccountFromFile({
      password: '',
      accountFile: accountFile!,
      additionalActionOnDecryptError: () => {
        setAccountFile(accountFile);
        setOpenedPasswordModal(true);
      },
    });
  }, [importAccountFromFile]);
  const closePasswordModal = () => {
    setOpenedPasswordModal(false);
  };

  const onChangeAddress = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setAddress(event.target.value);
  };

  const onChangeSeedOrPrivateKey = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setSeedOrPrivateKey(event.target.value);
  };

  const onChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setPasswordsNotEqual(false);
  };

  const onChangeConfirmedPassword = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmedPassword(event.target.value);
    setPasswordsNotEqual(false);
  };

  const loginToAccount = useCallback(() => {
    if (isWithoutPassword) {
      loginToWalletFromRegistration({ address, seedOrPrivateKey, password: '' });
    } else {
      const passwordsNotEqual = !compareTwoStrings(password!, confirmedPassword!);

      if (passwordsNotEqual) {
        setPasswordsNotEqual(passwordsNotEqual);
        return;
      }
      loginToWalletFromRegistration({ address, seedOrPrivateKey, password });
    }
  }, [address, seedOrPrivateKey, password, confirmedPassword, isWithoutPassword]);

  const handleImportAccount = (password: string) => {
    importAccountFromFile({
      password,
      accountFile: accountFile!,
    });

    closePasswordModal();
  };

  const renderLoginPart = useCallback(() => {
    const isButtonDisabled = !address ||
    !seedOrPrivateKey ||
    (passwordsNotEqual && !password && !isWithoutPassword);
    return (
      <>
        <div className={styles.title}>
          Enter account number and seed phrase
        </div>
        <div className={styles.fields}>
          <OutlinedInput
            placeholder={t('address')!}
            className={registrationStyles.passwordInput}
            value={address}
            onChange={onChangeAddress}
          />
          <OutlinedInput
            placeholder={t('seedPhraseOrPrivateKey')!}
            className={registrationStyles.passwordInput}
            value={seedOrPrivateKey}
            type={'password'}
            onChange={onChangeSeedOrPrivateKey}
          />
          <OutlinedInput
            placeholder={t('password')!}
            className={registrationStyles.passwordInput}
            value={password}
            type={'password'}
            onChange={onChangePassword}
            disabled={isWithoutPassword}
          />
          <OutlinedInput
            placeholder={t('repeatedPassword')!}
            className={registrationStyles.passwordInput}
            value={confirmedPassword}
            type={'password'}
            error={passwordsNotEqual}
            errorMessage={t('oopsPasswordsDidntMatch')!}
            onChange={onChangeConfirmedPassword}
            disabled={isWithoutPassword}
          />
          <FormControlLabel
            control={
              <Checkbox
                size={'medium'}
                checked={isWithoutPassword}
                onClick={() => setIsWithoutPassword(!isWithoutPassword)}
                disableRipple
              />
            }
            label="I don't want to use a password to encrypt my key"
            className={styles.checkBoxLabel}
          />
        </div>
        <Button
          className={styles.button}
          variant="contained"
          size="large"
          onClick={loginToAccount}
          disabled={isButtonDisabled}
        >
          Login
        </Button>
      </>
    );
  }, [address, seedOrPrivateKey, passwordsNotEqual, password, isWithoutPassword, t, confirmedPassword, loginToAccount]);

  const renderInitCards = useCallback(() => (
    <>
      <div className={styles.title}>
        Login or import an account
      </div>
      <input
        ref={importAccountRef}
        className={registrationStyles.importAccountInput}
        onChange={setAccountFileHandler}
        type="file"
      />
      <div className={styles.cards}>
        <RegistrationCard
          title="Login to account"
          iconType={2}
          description="Enter the address and seed phrase"
          buttonVariant="outlined"
          buttonLabel="Enter"
          onSelect={() => setIsEnterToAccPressed(true)}
        />
        <RegistrationCard
          title="Import account"
          iconType={3}
          description="Upload the PEM file to import an account"
          buttonVariant="contained"
          buttonLabel="Select file"
          isWithBorder
          onSelect={handleOpenImportFile}
        />
      </div>
    </>
  ), [setAccountFileHandler]);

  return (
    <div className={registrationStyles.registrationPage}>
      <ImportAccountModal
        open={openedPasswordModal}
        onClose={closePasswordModal}
        onSubmit={handleImportAccount}
      />
      <LangMenu className={registrationStyles.langSelect} />
      <div className={registrationStyles.registrationWizardComponent}>
        <Link to={WalletRoutesEnum.root} className={registrationStyles.registrationPageTitle}>Power Wallet</Link>
        <div className={registrationStyles.registrationWizardHolder}>
          {isEnterToAccPressed ? renderLoginPart() : renderInitCards()}
        </div>
      </div>
    </div>
  );
};

export const LoginPage = connector(LoginPageComponent);
