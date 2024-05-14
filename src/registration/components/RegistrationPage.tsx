import {
  BreadcrumbsTypeEnum,
  Button,
  LangMenu,
  PELogoWithTitle,
  Wizard,
} from 'common';
import { push } from 'connected-react-router';
import React, {
  FC, useCallback, useMemo, useState,
} from 'react';
import {
  useTranslation,
} from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';
import { WalletRoutesEnum } from '../../application/typings/routes';
import { getRegistrationTabs } from '../typings/registrationTypes';
import styles from './Registration.module.scss';
import { BeAware } from './pages/BeAware';
import { QuickGuide } from './pages/QuickGuide';
import { Backup } from './pages/backup/Backup';
import { RegisterPage } from './pages/loginRegisterAccount/RegisterPage';

const mapDispatchToProps = {
  routeTo: push,
};

const connector = connect(null, mapDispatchToProps);
type RegistrationPageProps = ConnectedProps<typeof connector>;

const RegistrationPageComponent: FC<RegistrationPageProps> = ({ routeTo }) => {
  const { t } = useTranslation();

  const [enterButtonPressed, setEnterButtonPressed] = useState(false);

  const getRegistrationBreadcrumbs = useMemo(() => [
    {
      label: getRegistrationTabs(t).quickGuide,
      component: QuickGuide,
    },
    {
      label: getRegistrationTabs(t).beAware,
      component: BeAware,
    },
    {
      label: getRegistrationTabs(t).loginRegister,
      component: RegisterPage,
    },
    {
      label: getRegistrationTabs(t).backup,
      component: Backup,
    },
  ], [t]);

  const handleProceedToRegistration = () => {
    setEnterButtonPressed(true);
  };

  const handleProceedToLogin = () => {
    routeTo(WalletRoutesEnum.login);
  };

  const renderWelcome = useCallback(() => (
    <>
      <div className={styles.registrationTitle}>{'Power Wallet'}</div>
      <div className={styles.registrationDesc}>
        {t('registrationPageDesc')}
      </div>
      <div className={styles.buttonsHolder}>
        <Button
          size="large"
          variant="filled"
          className={styles.loginButton}
          type="button"
          onClick={handleProceedToRegistration}
        >
          {t('registrationPageJoinButton')}
        </Button>
        <Button
          size="large"
          variant="outlined"
          className={styles.loginButton}
          type="button"
          onClick={handleProceedToLogin}
        >
          {t('registrationPageImportAccountButton')}
        </Button>
      </div>
    </>
  ), [t, handleProceedToLogin, handleProceedToRegistration]);

  const renderRegistration = useCallback(() => (
    <div className={styles.registrationWizardComponent}>
      <PELogoWithTitle className={styles.registrationPageIcon} />
      <div className={styles.registrationWizardHolder}>
        <Wizard
          className={styles.registrationWizard}
          breadcrumbs={getRegistrationBreadcrumbs}
          type={BreadcrumbsTypeEnum.direction}
          breadCrumbHasBorder
        />
      </div>
    </div>
  ), [getRegistrationBreadcrumbs]);

  return (
    <div className={styles.registrationPage}>
      <div className={styles.registrationPageCover} />
      <LangMenu className={styles.langSelect} />
      {enterButtonPressed ? renderRegistration() : renderWelcome()}
    </div>
  );
};

export const RegistrationPage = connector(RegistrationPageComponent);
