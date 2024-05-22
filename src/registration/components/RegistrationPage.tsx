import {
  BreadcrumbsTypeEnum,
  Button,
  Checkbox,
  LangMenu,
  Wizard,
} from 'common';
import { push } from 'connected-react-router';
import React, {
  FC, useCallback, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';
import { FormControlLabel } from '@mui/material';
import {
  setCreatingStep,
  setSelectedNetwork,
  setIsRandomChain,
  toggleIsWithoutPassword,
  generateSeedPhrase,
  setSelectedChain,
} from 'registration/slice/registrationSlice';
import { RootState } from 'application/store';
import {
  getCurrentBackupStep,
  getCurrentCreatingStep,
  getIsRandomChain,
  getIsWithoutPassword,
} from 'registration/selectors/registrationSelectors';
import { Link, RouteComponentProps } from 'react-router-dom';
import { stringToObject } from 'sso/utils';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import {
  AppQueryParams,
  WalletRoutesEnum,
} from '../../application/typings/routes';
import {
  BackupAccountStepsEnum,
  CreateAccountStepsEnum,
  getRegistrationTabs,
} from '../typings/registrationTypes';
import styles from './Registration.module.scss';
import { SelectNetwork } from './scenes/selectNetwork/SelectNetwork';
import { Backup } from './scenes/backup/Backup';
import { LoginToDapp } from './scenes/loginToDapp/LoginToDapp';

type OwnProps = RouteComponentProps<{ data?: string }>;

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  walletAddress: getWalletAddress(state),
  data: props?.match?.params?.data,
  creatingStep: getCurrentCreatingStep(state),
  backupStep: getCurrentBackupStep(state),
  isRandomChain: getIsRandomChain(state),
  isWithoutPassword: getIsWithoutPassword(state),
});

const mapDispatchToProps = {
  routeTo: push,
  setIsRandomChain,
  setSelectedNetwork,
  setCreatingStep,
  toggleIsWithoutPassword,
  generateSeedPhrase,
  setSelectedChain,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type RegistrationPageProps = ConnectedProps<typeof connector>;

const RegistrationPageComponent: FC<RegistrationPageProps> = ({
  data,
  routeTo,
  setIsRandomChain,
  toggleIsWithoutPassword,
  isRandomChain,
  isWithoutPassword,
  setSelectedNetwork,
  creatingStep,
  backupStep,
  setCreatingStep,
  walletAddress,
  setSelectedChain,
}) => {
  const { t } = useTranslation();

  const [enterButtonPressed, setEnterButtonPressed] = useState(false);

  const parsedData: AppQueryParams = useMemo(() => {
    if (data) return stringToObject(data);
    return null;
  }, [data]);

  useEffect(() => {
    if (walletAddress) {
      routeTo(`${WalletRoutesEnum.sso}/${data}`);
    } else if (parsedData?.chainID) {
      setEnterButtonPressed(true);
      setCreatingStep(CreateAccountStepsEnum.backup);
      setIsRandomChain(false);
      setSelectedChain(parsedData.chainID);
    }
  }, [
    data,
    parsedData?.chainID,
  ]);

  const getRegistrationBreadcrumbs = useMemo(
    () => (
      data
        ? [
          {
            label: getRegistrationTabs(t).selectNetwork,
            component: SelectNetwork,
          },
          {
            label: getRegistrationTabs(t).backup,
            component: Backup,
          },
          {
            label: getRegistrationTabs(t).login,
            component: LoginToDapp,
          },
        ]
        : [
          {
            label: getRegistrationTabs(t).selectNetwork,
            component: SelectNetwork,
          },
          {
            label: getRegistrationTabs(t).backup,
            component: Backup,
          },
        ]),
    [t],
  );

  const handleProceedToRegistration = useCallback(() => {
    setEnterButtonPressed(true);
  }, [setEnterButtonPressed]);

  const handleProceedToLogin = useCallback(() => {
    routeTo(WalletRoutesEnum.login);
  }, [routeTo]);

  const onSelectBreadCrumb = (nextStep: number) => {
    setCreatingStep(nextStep);
  };

  const renderWelcome = useCallback(
    () => (
      <>
        <Link to={WalletRoutesEnum.root} className={styles.registrationTitle}>
          Power Wallet
        </Link>
        <div className={styles.registrationDesc}>
          {t('registrationPageDesc')}
        </div>
        <div className={styles.buttonsHolder}>
          <Button
            size="large"
            variant="contained"
            type="button"
            onClick={handleProceedToRegistration}
          >
            {t('registrationPageJoinButton')}
          </Button>
          <Button
            size="large"
            variant="outlined"
            type="button"
            onClick={handleProceedToLogin}
          >
            {t('registrationPageImportAccountButton')}
          </Button>
        </div>
      </>
    ),
    [t, handleProceedToLogin, handleProceedToRegistration],
  );

  const toggleRandomChainHandler = useCallback(() => {
    if (isRandomChain) setSelectedNetwork(null);
    setIsRandomChain(!isRandomChain);
  }, [isRandomChain, setSelectedNetwork, setIsRandomChain]);

  const renderCheckBox = useCallback(() => {
    if (creatingStep === CreateAccountStepsEnum.selectNetwork) {
      return (
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
      );
    }
    if (
      creatingStep === CreateAccountStepsEnum.backup &&
      backupStep === BackupAccountStepsEnum.encryptPrivateKey
    ) {
      return (
        <div className={styles.checkBoxHolder}>
          <FormControlLabel
            control={
              <Checkbox
                size={'medium'}
                checked={isWithoutPassword}
                onClick={() => toggleIsWithoutPassword()}
                disableRipple
              />
            }
            label="I don't want to use a password to encrypt my key"
            className={styles.checkBoxLabel}
          />
        </div>
      );
    }
    return null;
  }, [
    backupStep,
    creatingStep,
    isRandomChain,
    isWithoutPassword,
    toggleIsWithoutPassword,
    toggleRandomChainHandler,
  ]);

  const renderRegistration = useCallback(
    () => (
      <div className={styles.registrationWizardComponent}>
        <div className={styles.registrationPageTitle}>Power Wallet</div>
        <LangMenu className={styles.langSelect} />
        <div className={styles.registrationWizardHolder}>
          <Wizard
            className={styles.registrationWizard}
            currentStep={creatingStep}
            breadcrumbs={getRegistrationBreadcrumbs}
            type={BreadcrumbsTypeEnum.direction}
            breadCrumbHasBorder
            onSelectBreadCrumb={onSelectBreadCrumb}
          />
        </div>
        {renderCheckBox()}
      </div>
    ),
    [
      creatingStep,
      getRegistrationBreadcrumbs,
      onSelectBreadCrumb,
      renderCheckBox,
    ],
  );

  return (
    <div className={styles.registrationPage}>
      {enterButtonPressed ? renderRegistration() : renderWelcome()}
    </div>
  );
};

export const RegistrationPage = connector(RegistrationPageComponent);
