import {
  BreadcrumbsTypeEnum,
  Button,
  Checkbox,
  LangMenu,
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
import { FormControlLabel } from '@mui/material';
import { setSelectedNetwork, toggleRandomChain } from 'registration/slice/registrationSlice';
import { RootState } from 'application/store';
import { getIsRandomChain } from 'registration/selectors/registrationSelectors';
import { WalletRoutesEnum } from '../../application/typings/routes';
import { getRegistrationTabs } from '../typings/registrationTypes';
import styles from './Registration.module.scss';
import { SelectNetwork } from './scenes/selectNetwork/SelectNetwork';
import { Backup } from './scenes/backup/Backup';
import { RegisterPage } from './pages/loginRegisterAccount/RegisterPage';

const mapStateToProps = (state: RootState) => ({
  isRandomChain: getIsRandomChain(state),
});

const mapDispatchToProps = {
  routeTo: push,
  toggleRandomChain,
  setSelectedNetwork,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type RegistrationPageProps = ConnectedProps<typeof connector>;

const RegistrationPageComponent: FC<RegistrationPageProps> = ({
  routeTo, toggleRandomChain, isRandomChain, setSelectedNetwork,
}) => {
  const { t } = useTranslation();

  const [enterButtonPressed, setEnterButtonPressed] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const getRegistrationBreadcrumbs = useMemo(() => [
    {
      label: getRegistrationTabs(t).selectNetwork,
      component: SelectNetwork,
    },
    {
      label: getRegistrationTabs(t).backup,
      component: Backup,
    },
    {
      label: getRegistrationTabs(t).loginRegister,
      component: RegisterPage,
    },
  ], [t]);

  const handleProceedToRegistration = useCallback(() => {
    setEnterButtonPressed(true);
  }, [setEnterButtonPressed]);

  const handleProceedToLogin = useCallback(() => {
    routeTo(WalletRoutesEnum.login);
  }, [routeTo]);

  const onSelectBreadCrumb = (nextStep: number) => {
    setCurrentStep(nextStep);
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

  const toggleRandomChainHandler = useCallback(() => {
    if (isRandomChain) setSelectedNetwork(null);
    toggleRandomChain();
  }, [isRandomChain, setSelectedNetwork, toggleRandomChain]);

  const renderCheckBox = useCallback(() => (
    <div className={styles.checkBoxHolder}>
      <FormControlLabel
        control={
          <Checkbox
            size={'medium'}
            checked={!isRandomChain}
            onClick={() => toggleRandomChainHandler()}
            disableRipple
          />
        }
        label="I want to select a chain by number"
        className={styles.checkBoxLabel}
      />
    </div>
  ), [isRandomChain, toggleRandomChainHandler]);

  const renderRegistration = useCallback(() => (
    <div className={styles.registrationWizardComponent}>
      <div className={styles.registrationPageTitle}>Power Wallet</div>
      <LangMenu className={styles.langSelect} />
      <div className={styles.registrationWizardHolder}>
        <Wizard
          className={styles.registrationWizard}
          breadcrumbs={getRegistrationBreadcrumbs}
          type={BreadcrumbsTypeEnum.direction}
          breadCrumbHasBorder
          onSelectBreadCrumb={onSelectBreadCrumb}
        />
      </div>
      {currentStep === 0 && renderCheckBox()}
    </div>
  ), [currentStep, getRegistrationBreadcrumbs, renderCheckBox]);

  return (
    <div className={styles.registrationPage}>
      {enterButtonPressed ? renderRegistration() : renderWelcome()}
    </div>
  );
};

export const RegistrationPage = connector(RegistrationPageComponent);
