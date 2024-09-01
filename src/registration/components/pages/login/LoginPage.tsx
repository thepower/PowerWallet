import React, {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { FormControlLabel, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';
import { Link } from 'react-router-dom';
import { useImportWalletFromFile } from 'account/hooks';
// import { importAccountFromFile } from 'account/slice/accountSlice';
import { RootState } from 'application/reduxStore';
import { WalletRoutesEnum } from 'application/typings/routes';
import { ChevronLeftIcon, ChevronRightIcon } from 'assets/icons';
import {
  Button,
  Checkbox,
  LangMenu,
  OutlinedInput,
  IconButton
  // FullScreenLoader
} from 'common';
import hooks from 'hooks';
import { checkIfLoading } from 'network/selectors';
import { RegistrationCard } from 'registration/components/common/registrationCard/RegistrationCard';
import { compareTwoStrings } from 'registration/utils/registrationUtils';
import { Maybe } from 'typings/common';
import styles from './LoginPage.module.scss';
import { loginToWalletFromRegistration } from '../../../slice/registrationSlice';
import { ImportAccountModal } from '../../modals/ImportAccountModal';
import registrationStyles from '../registration/RegistrationPage.module.scss';

const mapStateToProps = (state: RootState) => ({
  // isImportAccountFromFileLoading: checkIfLoading(
  //   state,
  //   importAccountFromFile.type
  // ),
  isLoginToWalletFromRegistrationLoading: checkIfLoading(
    state,
    loginToWalletFromRegistration.type
  )
});

const mapDispatchToProps = {
  // importAccountFromFile,
  loginToWalletFromRegistration
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type LoginPageProps = ConnectedProps<typeof connector>;

const LoginPageComponent: FC<LoginPageProps> = ({
  // importAccountFromFile,
  loginToWalletFromRegistration,
  // isImportAccountFromFileLoading,
  isLoginToWalletFromRegistrationLoading
  // walletAddress
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

  const {
    scrollContainerRef,
    scrollToElementByIndex,
    scrollToNext,
    scrollToPrevious
  } = hooks.useSmoothHorizontalScroll();

  const { importWalletFromFileMutation } = useImportWalletFromFile();

  const resetStage = () => {
    setAccountFile(null);
    setAddress('');
    setSeedOrPrivateKey('');
    setPassword('');
    setConfirmedPassword('');
    setPasswordsNotEqual(false);
    setIsEnterToAccPressed(false);
    setIsWithoutPassword(false);
  };

  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    if (isMobile) {
      scrollToElementByIndex(0);
    }
  }, []);

  const handleOpenImportFile = () => {
    if (importAccountRef) {
      importAccountRef.current?.click();
    }
  };

  const setAccountFileHandler = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const accountFile = event?.target?.files?.[0];

      importWalletFromFileMutation({
        password: '',
        accountFile: accountFile!,
        additionalActionOnDecryptError: () => {
          if (accountFile) {
            setAccountFile(accountFile);
            setOpenedPasswordModal(true);
          }
        }
      });
    },
    [importWalletFromFileMutation]
  );
  const closePasswordModal = () => {
    setOpenedPasswordModal(false);
  };

  const onChangeAddress = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setAddress(event.target.value);
  };

  const onChangeSeedOrPrivateKey = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setSeedOrPrivateKey(event.target.value);
  };

  const onChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setPasswordsNotEqual(false);
  };

  const onChangeConfirmedPassword = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmedPassword(event.target.value);
    setPasswordsNotEqual(false);
  };

  const loginToAccount = useCallback(() => {
    if (isWithoutPassword) {
      loginToWalletFromRegistration({
        address,
        seedOrPrivateKey,
        password: ''
      });
    } else {
      const passwordsNotEqual = !compareTwoStrings(
        password!,
        confirmedPassword!
      );

      if (passwordsNotEqual) {
        setPasswordsNotEqual(passwordsNotEqual);
        return;
      }
      loginToWalletFromRegistration({ address, seedOrPrivateKey, password });
    }
  }, [
    isWithoutPassword,
    loginToWalletFromRegistration,
    address,
    seedOrPrivateKey,
    password,
    confirmedPassword
  ]);

  const handleImportAccount = (password: string) => {
    importWalletFromFileMutation({
      password,
      accountFile: accountFile!
    });

    closePasswordModal();
  };

  const renderLoginPart = useCallback(() => {
    const isButtonDisabled =
      !address ||
      !seedOrPrivateKey ||
      (passwordsNotEqual && !password && !isWithoutPassword);
    return (
      <>
        <div className={styles.title}>
          {t('enterAccountNumberAndSeedPhrase')}
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
            label={t('IDontWantUsePassword')}
            className={styles.checkBoxLabel}
          />
        </div>
        <Button
          className={styles.button}
          variant='contained'
          size='large'
          onClick={loginToAccount}
          disabled={isButtonDisabled}
          loading={isLoginToWalletFromRegistrationLoading}
        >
          {t('login')}
        </Button>
      </>
    );
  }, [
    address,
    seedOrPrivateKey,
    passwordsNotEqual,
    password,
    isWithoutPassword,
    t,
    confirmedPassword,
    loginToAccount,
    isLoginToWalletFromRegistrationLoading
  ]);

  const renderInitCards = useCallback(
    () => (
      <>
        <div className={styles.title}>{t('loginImport')}</div>
        <input
          ref={importAccountRef}
          className={registrationStyles.importAccountInput}
          onChange={setAccountFileHandler}
          type='file'
        />
        <div ref={scrollContainerRef} className={styles.cards}>
          <RegistrationCard
            title={t('loginToAccount')}
            iconType={2}
            description={t('enterAddressAndSeedPhrase')}
            buttonVariant='outlined'
            buttonLabel={t('enter')}
            onSelect={() => setIsEnterToAccPressed(true)}
          />
          <RegistrationCard
            title={t('importAccount')}
            iconType={3}
            description={t('uploadPEMFileToImportAccount')}
            buttonVariant='contained'
            buttonLabel={t('selectFile')}
            isWithBorder
            onSelect={handleOpenImportFile}
          />
        </div>
        <IconButton className={styles.leftArrow} onClick={scrollToPrevious}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton className={styles.rightArrow} onClick={scrollToNext}>
          <ChevronRightIcon />
        </IconButton>
      </>
    ),
    [
      t,
      scrollContainerRef,
      scrollToNext,
      scrollToPrevious,
      setAccountFileHandler
    ]
  );

  // if (isImportAccountFromFileLoading) {
  //   return <FullScreenLoader />;
  // }

  return (
    <div className={registrationStyles.registrationPage}>
      <ImportAccountModal
        open={openedPasswordModal}
        onClose={closePasswordModal}
        onSubmit={handleImportAccount}
      />
      <div className={registrationStyles.registrationWizardComponent}>
        <div className={registrationStyles.registrationPageHeader}>
          <div style={{ width: '48px' }} />
          <Link
            to={WalletRoutesEnum.root}
            className={registrationStyles.registrationPageTitle}
            onClick={resetStage}
          >
            Power Wallet
          </Link>
          <LangMenu className={registrationStyles.registrationPageLangSelect} />
        </div>
        <div className={registrationStyles.registrationWizardHolder}>
          {isEnterToAccPressed ? renderLoginPart() : renderInitCards()}
        </div>
      </div>
    </div>
  );
};

export const LoginPage = connector(LoginPageComponent);
