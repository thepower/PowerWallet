import { FC, useCallback, useEffect, useMemo } from 'react';
import { FormControlLabel } from '@mui/material';
import { AddressApi } from '@thepowereco/tssdk';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import { useStore } from 'application/store';
import { AppQueryParams, WalletRoutesEnum } from 'application/typings/routes';
import { BreadcrumbsTypeEnum, Checkbox, LangMenu, Wizard } from 'common';

import { stringToObject } from 'sso/utils';
import styles from './RegistrationPage.module.scss';
import {
  BackupAccountStepsEnum,
  CreateAccountStepsEnum,
  getRegistrationTabs
} from '../../../typings/registrationTypes';
import { Backup } from '../../scenes/backup/Backup';
import { LoginToDapp } from '../../scenes/loginToDapp/LoginToDapp';
import { SelectNetwork } from '../../scenes/selectNetwork/SelectNetwork';

const RegistrationPageComponent: FC = () => {
  const { t } = useTranslation();
  const { dataOrReferrer } = useParams<{ dataOrReferrer?: string }>();
  const isAddressInParams = useMemo(
    () => dataOrReferrer && AddressApi.isTextAddressValid(dataOrReferrer),
    [dataOrReferrer]
  );
  const {
    isRandomChain,
    creatingStep,
    backupStep,
    isWithoutPassword,
    setCreatingStep,
    setIsRandomChain,
    setSelectedChain,
    setIsWithoutPassword,
    setSelectedNetwork
  } = useStore();

  const parsedData: AppQueryParams = useMemo(() => {
    if (!isAddressInParams && dataOrReferrer)
      return stringToObject(dataOrReferrer);
    return null;
  }, [dataOrReferrer, isAddressInParams]);

  useEffect(() => {
    if (parsedData?.chainID) {
      setCreatingStep(CreateAccountStepsEnum.backup);
      setIsRandomChain(false);
      setSelectedChain(parsedData.chainID);
    }
  }, [parsedData]);

  const resetStage = useCallback(() => {
    setCreatingStep(CreateAccountStepsEnum.selectNetwork);
    setIsRandomChain(true);
    setSelectedChain(null);
  }, []);

  const getRegistrationBreadcrumbs = useMemo(
    () =>
      !isAddressInParams && parsedData
        ? [
            {
              label: getRegistrationTabs(t).selectNetwork,
              component: SelectNetwork
            },
            {
              label: getRegistrationTabs(t).backup,
              component: Backup
            },
            {
              label: getRegistrationTabs(t).login,
              component: LoginToDapp
            }
          ]
        : [
            {
              label: getRegistrationTabs(t).selectNetwork,
              component: SelectNetwork
            },
            {
              label: getRegistrationTabs(t).backup,
              component: Backup
            }
          ],
    [parsedData, isAddressInParams, t]
  );

  const onSelectBreadCrumb = useCallback((nextStep: number) => {
    setCreatingStep(nextStep);
  }, []);

  const toggleRandomChainHandler = useCallback(() => {
    if (!isRandomChain) setSelectedNetwork(null);
    setIsRandomChain(!isRandomChain);
  }, [isRandomChain]);

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
            label={t('iWantToSelectChain')}
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
                onClick={() => setIsWithoutPassword(!isWithoutPassword)}
                disableRipple
              />
            }
            label={t('IDontWantUsePassword')}
            className={styles.checkBoxLabel}
          />
        </div>
      );
    }
    return null;
  }, [
    t,
    backupStep,
    creatingStep,
    isRandomChain,
    isWithoutPassword,
    toggleRandomChainHandler
  ]);

  const renderRegistration = useCallback(
    () => (
      <div className={styles.registrationWizardComponent}>
        <div className={styles.registrationPageHeader}>
          <div style={{ width: '48px' }} />
          <Link
            to={WalletRoutesEnum.root}
            className={styles.registrationPageTitle}
            onClick={resetStage}
          >
            Power Wallet
          </Link>
          <LangMenu className={styles.registrationPageLangSelect} />
        </div>
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
      resetStage
    ]
  );

  return <div className={styles.registrationPage}>{renderRegistration()}</div>;
};

export const RegistrationPage = RegistrationPageComponent;
