import React, {
  FC,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect
} from 'react';
import { FormControlLabel, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useImportWalletFromFile } from 'account/hooks';
import { AppQueryParams, WalletRoutesEnum } from 'application/typings/routes';
import { ChevronLeftIcon, ChevronRightIcon } from 'assets/icons';
import { Button, Checkbox, LangMenu, OutlinedInput, IconButton } from 'common';
import hooks from 'hooks';
import { RegistrationCard } from 'registration/components/common/registrationCard/RegistrationCard';
import { useRegistrationLoginToWallet } from 'registration/hooks/useRegistrationLoginToWallet';
import { compareTwoStrings } from 'registration/utils/registrationUtils';
import { stringToObject, objectToString } from 'sso/utils';
import styles from './LoginPage.module.scss';
import { ImportAccountModal } from '../../modals/ImportAccountModal';
import registrationStyles from '../registration/RegistrationPage.module.scss';

const LoginPageComponent: FC = () => {
  const { t } = useTranslation();
  const { data } = useParams<{ data?: string }>();
  const isMobile = useMediaQuery('(max-width:768px)');

  const [state, setState] = useState<{
    openedPasswordModal: boolean;
    accountFile: File | null;
    address: string;
    seedOrPrivateKey: string;
    password: string;
    confirmedPassword: string;
    passwordsNotEqual: boolean;
    isEnterToAccPressed: boolean;
    isWithoutPassword: boolean;
  }>({
    openedPasswordModal: false,
    accountFile: null,
    address: '',
    seedOrPrivateKey: '',
    password: '',
    confirmedPassword: '',
    passwordsNotEqual: false,
    isEnterToAccPressed: false,
    isWithoutPassword: false
  });

  const parsedData: AppQueryParams = useMemo(
    () => (data ? stringToObject(data) : null),
    [data]
  );

  const { loginMutation, isPending } = useRegistrationLoginToWallet({
    throwOnError: false
  });
  const { importWalletFromFileMutation, isLoading: isImportWalletLoading } =
    useImportWalletFromFile();

  const {
    scrollContainerRef,
    scrollToElementByIndex,
    scrollToNext,
    scrollToPrevious
  } = hooks.useSmoothHorizontalScroll();

  const importAccountRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isMobile) {
      scrollToElementByIndex(1);
    }
  }, []);

  const resetState = () =>
    setState({
      openedPasswordModal: false,
      accountFile: null,
      address: '',
      seedOrPrivateKey: '',
      password: '',
      confirmedPassword: '',
      passwordsNotEqual: false,
      isEnterToAccPressed: false,
      isWithoutPassword: false
    });

  const updateState = (newState: Partial<typeof state>) =>
    setState((prevState) => ({ ...prevState, ...newState }));

  const handleImportFile = useCallback(() => {
    importAccountRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        importWalletFromFileMutation({
          password: '',
          accountFile: file,
          additionalActionOnSuccess: handleImportSuccess,
          additionalActionOnDecryptError: () =>
            updateState({ accountFile: file, openedPasswordModal: true }),
          isWithoutGoHome: Boolean(parsedData)
        });
      }
    },
    [importWalletFromFileMutation, updateState, parsedData]
  );

  const handleImportSuccess = useCallback(
    (result: any) => {
      if (parsedData?.callbackUrl) {
        if (parsedData.chainID === result?.chainId) {
          const stringData = objectToString({
            address: result?.address,
            returnUrl: parsedData?.returnUrl
          });
          window.location.replace(`${parsedData.callbackUrl}sso/${stringData}`);
        } else {
          toast.error(t('wrongChainLogin'));
        }
      }
    },
    [parsedData, t]
  );

  const handleLogin = useCallback(() => {
    const {
      isWithoutPassword,
      address,
      seedOrPrivateKey,
      password,
      confirmedPassword
    } = state;
    if (isWithoutPassword) {
      loginMutation({ address, seedOrPrivateKey, password: '' });
    } else {
      const passwordsNotEqual = !compareTwoStrings(password, confirmedPassword);
      if (passwordsNotEqual) {
        updateState({ passwordsNotEqual });
        return;
      }
      loginMutation({ address, seedOrPrivateKey, password });
    }
  }, [state, loginMutation]);

  const renderLoginForm = () => {
    const {
      address,
      seedOrPrivateKey,
      password,
      confirmedPassword,
      passwordsNotEqual,
      isWithoutPassword
    } = state;
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
            onChange={(e) => updateState({ address: e.target.value })}
          />
          <OutlinedInput
            placeholder={t('seedPhraseOrPrivateKey')!}
            className={registrationStyles.passwordInput}
            value={seedOrPrivateKey}
            type='password'
            onChange={(e) => updateState({ seedOrPrivateKey: e.target.value })}
          />
          <OutlinedInput
            placeholder={t('password')!}
            className={registrationStyles.passwordInput}
            value={password}
            type='password'
            onChange={(e) =>
              updateState({
                password: e.target.value,
                passwordsNotEqual: false
              })
            }
            disabled={isWithoutPassword}
          />
          <OutlinedInput
            placeholder={t('repeatedPassword')!}
            className={registrationStyles.passwordInput}
            value={confirmedPassword}
            type='password'
            error={passwordsNotEqual}
            errorMessage={t('oopsPasswordsDidntMatch')!}
            onChange={(e) =>
              updateState({
                confirmedPassword: e.target.value,
                passwordsNotEqual: false
              })
            }
            disabled={isWithoutPassword}
          />
          <FormControlLabel
            control={
              <Checkbox
                size='medium'
                checked={isWithoutPassword}
                onClick={() =>
                  updateState({ isWithoutPassword: !isWithoutPassword })
                }
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
          onClick={handleLogin}
          disabled={isButtonDisabled}
          loading={isPending}
        >
          {t('login')}
        </Button>
      </>
    );
  };

  const renderInitialCards = () => (
    <>
      <div className={styles.title}>{t('loginImport')}</div>
      <input
        ref={importAccountRef}
        className={registrationStyles.importAccountInput}
        onChange={handleFileChange}
        type='file'
      />
      <div ref={scrollContainerRef} className={styles.cards}>
        <RegistrationCard
          title={t('loginToAccount')}
          iconType={2}
          description={t('enterAddressAndSeedPhrase')}
          buttonVariant='outlined'
          buttonLabel={t('enter')}
          onSelect={() => updateState({ isEnterToAccPressed: true })}
        />
        <RegistrationCard
          title={t('importAccount')}
          iconType={3}
          description={t('uploadPEMFileToImportAccount')}
          buttonVariant='contained'
          buttonLabel={t('selectFile')}
          isWithBorder
          loading={isImportWalletLoading}
          onSelect={handleImportFile}
        />
      </div>
      <IconButton className={styles.leftArrow} onClick={scrollToPrevious}>
        <ChevronLeftIcon />
      </IconButton>
      <IconButton className={styles.rightArrow} onClick={scrollToNext}>
        <ChevronRightIcon />
      </IconButton>
    </>
  );

  return (
    <div className={registrationStyles.registrationPage}>
      <ImportAccountModal
        open={state.openedPasswordModal}
        onClose={() => updateState({ openedPasswordModal: false })}
        onSubmit={(password: string) => {
          importWalletFromFileMutation({
            password,
            accountFile: state.accountFile!,
            additionalActionOnSuccess: handleImportSuccess,
            isWithoutGoHome: Boolean(parsedData)
          });
          updateState({ openedPasswordModal: false });
        }}
      />
      <div className={registrationStyles.registrationWizardComponent}>
        <div className={registrationStyles.registrationPageHeader}>
          <div style={{ width: '48px' }} />
          <Link
            to={WalletRoutesEnum.root}
            className={registrationStyles.registrationPageTitle}
            onClick={resetState}
          >
            Power Wallet
          </Link>
          <LangMenu className={registrationStyles.registrationPageLangSelect} />
        </div>
        <div className={registrationStyles.registrationWizardHolder}>
          {state.isEnterToAccPressed ? renderLoginForm() : renderInitialCards()}
        </div>
      </div>
    </div>
  );
};

export const LoginPage = LoginPageComponent;
