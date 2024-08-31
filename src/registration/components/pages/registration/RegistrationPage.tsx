import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { FormControlLabel } from '@mui/material';
import { AddressApi } from '@thepowereco/tssdk';
import { push } from 'connected-react-router';
import { useTranslation } from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { RootState } from 'application/reduxStore';
import { BreadcrumbsTypeEnum, Checkbox, LangMenu, Wizard } from 'common';
import {
  getCurrentCreatingStep,
  getIsRandomChain,
  getIsWithoutPassword,
  getCurrentBackupStep
} from 'registration/selectors/registrationSelectors';
import {
  setCreatingStep,
  setSelectedNetwork,
  setIsRandomChain,
  setIsWithoutPassword,
  setSelectedChain
} from 'registration/slice/registrationSlice';
import { stringToObject } from 'sso/utils';
import styles from './RegistrationPage.module.scss';
import {
  AppQueryParams,
  WalletRoutesEnum
} from '../../../../application/typings/routes';
import {
  BackupAccountStepsEnum,
  CreateAccountStepsEnum,
  getRegistrationTabs
} from '../../../typings/registrationTypes';
import { Backup } from '../../scenes/backup/Backup';
import { LoginToDapp } from '../../scenes/loginToDapp/LoginToDapp';
import { SelectNetwork } from '../../scenes/selectNetwork/SelectNetwork';

const mapStateToProps = (state: RootState) => ({
  walletAddress: getWalletAddress(state),
  creatingStep: getCurrentCreatingStep(state),
  backupStep: getCurrentBackupStep(state),
  isRandomChain: getIsRandomChain(state),
  isWithoutPassword: getIsWithoutPassword(state)
});

const mapDispatchToProps = {
  routeTo: push,
  setIsRandomChain,
  setSelectedNetwork,
  setCreatingStep,
  setIsWithoutPassword,
  setSelectedChain
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type RegistrationPageProps = ConnectedProps<typeof connector>;

const RegistrationPageComponent: FC<RegistrationPageProps> = ({
  routeTo,
  setIsRandomChain,
  setIsWithoutPassword,
  isRandomChain,
  isWithoutPassword,
  setSelectedNetwork,
  creatingStep,
  backupStep,
  setCreatingStep,
  walletAddress,
  setSelectedChain
}) => {
  const { t } = useTranslation();
  const { dataOrReferrer } = useParams<{ dataOrReferrer?: string }>();
  const isAddressInParams = useMemo(
    () => dataOrReferrer && AddressApi.isTextAddressValid(dataOrReferrer),
    [dataOrReferrer]
  );

  const parsedData: AppQueryParams = useMemo(() => {
    if (!isAddressInParams && dataOrReferrer)
      return stringToObject(dataOrReferrer);
    return null;
  }, [dataOrReferrer, isAddressInParams]);

  useEffect(() => {
    if (walletAddress) {
      if (!isAddressInParams) {
        routeTo(`${WalletRoutesEnum.sso}/${dataOrReferrer}`);
      } else {
        routeTo(WalletRoutesEnum.root);
      }
    } else if (parsedData?.chainID) {
      setCreatingStep(CreateAccountStepsEnum.backup);
      setIsRandomChain(false);
      setSelectedChain(parsedData.chainID);
    }
  }, [dataOrReferrer]);

  const resetStage = () => {
    setCreatingStep(CreateAccountStepsEnum.selectNetwork);
    setIsRandomChain(true);
    setSelectedChain(null);
  };

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

  const onSelectBreadCrumb = (nextStep: number) => {
    setCreatingStep(nextStep);
  };

  const toggleRandomChainHandler = useCallback(() => {
    if (!isRandomChain) setSelectedNetwork(null);
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
    setIsWithoutPassword,
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

export const RegistrationPage = connector(RegistrationPageComponent);
