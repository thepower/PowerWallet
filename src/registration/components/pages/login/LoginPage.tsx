import React, {
  FC,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect
} from 'react';
import { FormControlLabel, useMediaQuery } from '@mui/material';
import { Maybe } from '@thepowereco/tssdk';
import { useFormik } from 'formik';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { useImportWalletFromFile } from 'account/hooks';
import { AppQueryParams, WalletRoutesEnum } from 'application/typings/routes';
import { ChevronLeftIcon, ChevronRightIcon } from 'assets/icons';
import { Button, LangMenu, OutlinedInput, IconButton, Checkbox } from 'common';
import hooks from 'hooks';
import { RegistrationCard } from 'registration/components/common/registrationCard/RegistrationCard';
import { useRegistrationLoginToWallet } from 'registration/hooks/useRegistrationLoginToWallet';
import { stringToObject, objectToString } from 'sso/utils';
import styles from './LoginPage.module.scss';
import { ImportAccountModal } from '../../modals/ImportAccountModal';
import registrationStyles from '../registration/RegistrationPage.module.scss';

const initialValues = {
  address: '',
  seedOrPrivateKey: '',
  password: '',
  confirmedPassword: '',
  isWithoutPassword: false,
  isEnterToAccPressed: false
};

const validationSchema = (t: TFunction) =>
  yup.object().shape({
    address: yup.string().required(t('required')),
    seedOrPrivateKey: yup.string().required(t('required')),
    password: yup.string().when('isWithoutPassword', {
      is: false,
      then: yup.string().required(t('required'))
    }),
    confirmedPassword: yup.string().when('isWithoutPassword', {
      is: false,
      then: yup
        .string()
        .oneOf([yup.ref('password')], t('oopsPasswordsDidntMatch'))
        .required(t('required'))
    })
  });

const LoginPageComponent: FC = () => {
  const { t } = useTranslation();
  const { data } = useParams<{ data?: string }>();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [accountFile, setAccountFile] = useState<Maybe<File>>(null);
  const [openedPasswordModal, setOpenedPasswordModal] = useState(false);

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
  }, [isMobile, scrollToElementByIndex]);

  const formik = useFormik({
    initialValues,
    validationSchema: validationSchema(t),
    onSubmit: (values) => {
      const { address, seedOrPrivateKey, password, isWithoutPassword } = values;
      if (isWithoutPassword) {
        loginMutation({ address, seedOrPrivateKey, password: '' });
      } else {
        loginMutation({ address, seedOrPrivateKey, password });
      }
    }
  });

  const handleImportFile = useCallback(() => {
    importAccountRef.current?.click();
  }, []);

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

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log('event.target.files', event.target.files);
      const file = event.target.files?.[0];
      if (file) {
        importWalletFromFileMutation({
          password: '',
          accountFile: file,
          additionalActionOnSuccess: handleImportSuccess,
          additionalActionOnDecryptError: () => {
            setAccountFile(file);
            setOpenedPasswordModal(true);
          },
          isWithoutGoHome: Boolean(parsedData)
        });
      }
    },
    [importWalletFromFileMutation, handleImportSuccess, parsedData]
  );

  const renderLoginForm = () => {
    const { isWithoutPassword } = formik.values;

    return (
      <>
        <div className={styles.title}>
          {t('enterAccountNumberAndSeedPhrase')}
        </div>
        <form onSubmit={formik.handleSubmit} className={styles.fields}>
          <OutlinedInput
            placeholder={t('address')!}
            size='small'
            fullWidth
            error={Boolean(formik.touched.address && formik.errors.address)}
            errorMessage={formik.errors.address}
            {...formik.getFieldProps('address')}
          />
          <OutlinedInput
            placeholder={t('seedPhraseOrPrivateKey')!}
            size='small'
            fullWidth
            error={Boolean(
              formik.touched.seedOrPrivateKey && formik.errors.seedOrPrivateKey
            )}
            type='password'
            errorMessage={formik.errors.seedOrPrivateKey}
            {...formik.getFieldProps('seedOrPrivateKey')}
          />
          <OutlinedInput
            size='small'
            fullWidth
            placeholder={t('password')!}
            disabled={isWithoutPassword}
            error={Boolean(formik.touched.password && formik.errors.password)}
            type='password'
            errorMessage={formik.errors.password}
            {...formik.getFieldProps('password')}
          />
          <OutlinedInput
            size='small'
            fullWidth
            placeholder={t('repeatedPassword')!}
            disabled={isWithoutPassword}
            error={Boolean(
              formik.touched.confirmedPassword &&
                formik.errors.confirmedPassword
            )}
            errorMessage={formik.errors.confirmedPassword}
            type='password'
            {...formik.getFieldProps('confirmedPassword')}
          />
          <FormControlLabel
            control={
              <Checkbox
                size='medium'
                checked={formik.values.isWithoutPassword}
                onChange={() =>
                  formik.setFieldValue(
                    'isWithoutPassword',
                    !formik.values.isWithoutPassword
                  )
                }
                disableRipple
              />
            }
            label={t('IDontWantUsePassword')}
            className={styles.checkBoxLabel}
          />
          <Button
            className={styles.button}
            variant='contained'
            size='large'
            type='submit'
            loading={isPending}
            disabled={!formik.isValid || formik.isSubmitting}
          >
            {t('login')}
          </Button>
        </form>
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
          onSelect={() => formik.setFieldValue('isEnterToAccPressed', true)}
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
        open={openedPasswordModal}
        onClose={() => setOpenedPasswordModal(false)}
        onSubmit={(password: string) => {
          importWalletFromFileMutation({
            password,
            accountFile: accountFile!,
            additionalActionOnSuccess: handleImportSuccess,
            isWithoutGoHome: Boolean(parsedData)
          });
          setOpenedPasswordModal(false);
        }}
      />
      <div className={registrationStyles.registrationWizardComponent}>
        <div className={registrationStyles.registrationPageHeader}>
          <div style={{ width: '48px' }} />
          <Link
            to={WalletRoutesEnum.root}
            className={registrationStyles.registrationPageTitle}
            onClick={() => formik.resetForm()}
          >
            Power Wallet
          </Link>
          <LangMenu className={registrationStyles.registrationPageLangSelect} />
        </div>
        <div className={registrationStyles.registrationWizardHolder}>
          {formik.values.isEnterToAccPressed
            ? renderLoginForm()
            : renderInitialCards()}
        </div>
      </div>
    </div>
  );
};

export const LoginPage = LoginPageComponent;
