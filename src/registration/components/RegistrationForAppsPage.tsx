import React, {
  FC, useCallback, useEffect, useMemo,
} from 'react';
import { push } from 'connected-react-router';
import { connect, ConnectedProps } from 'react-redux';
import {
  BreadcrumbsTypeEnum,
  PELogoWithTitle,
  Wizard,
} from 'common';
import {
  generateSeedPhrase,
  setCreatingCurrentShard,
} from 'registration/slice/registrationSlice';
import { defaultChain } from 'application/sagas/initApplicationSaga';
import { stringToObject } from 'sso/utils';
import { RootState } from 'application/store';
import { RouteComponentProps } from 'react-router';

import { getWalletAddress } from 'account/selectors/accountSelectors';
import { WalletRoutesEnum } from 'application/typings/routes';
import {
  useTranslation,
} from 'react-i18next';
import { getRegistrationTabs } from '../typings/registrationTypes';

import styles from './Registration.module.scss';
import { RegisterForAppsPage } from './pages/loginRegisterAccount/RegisterForAppsPage';

type OwnProps = RouteComponentProps<{ data?: string }>;

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  walletAddress: getWalletAddress(state),
  data: props.match?.params?.data,
});

const mapDispatchToProps = {
  routeTo: push,
  setCreatingCurrentShard,
  generateSeedPhrase,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type RegistrationForAppsPageProps = ConnectedProps<typeof connector>;

const RegistrationForAppsPageComponent: FC<RegistrationForAppsPageProps> = ({
  routeTo,
  data,
  walletAddress,
  setCreatingCurrentShard,
  generateSeedPhrase,
}) => {
  const { t } = useTranslation();

  const registrationBreadcrumbs = useMemo(() => [
    {
      label: getRegistrationTabs(t).loginRegister,
      component: RegisterForAppsPage,
    },
    {
      label: getRegistrationTabs(t).backup,
    },
  ], [t]);

  const parsedData: { chainID: number; callbackUrl?: string } | null =
    useMemo(() => {
      if (data) return stringToObject(data);
      return null;
    }, [data]);

  useEffect(() => {
    if (walletAddress) {
      routeTo(`${WalletRoutesEnum.sso}/${data}`);
    } else {
      generateSeedPhrase();
      setCreatingCurrentShard(parsedData?.chainID || defaultChain);
    }
  }, [
    data,
    parsedData?.chainID,
    walletAddress,
  ]);

  const renderRegistration = useCallback(() => (
    <div className={styles.registrationWizardComponent}>
      <PELogoWithTitle className={styles.registrationPageIcon} />
      <div className={styles.registrationWizardHolder}>
        <Wizard
          className={styles.registrationWizard}
          breadcrumbs={registrationBreadcrumbs}
          type={BreadcrumbsTypeEnum.direction}
          breadCrumbHasBorder
        />
      </div>
    </div>
  ), [registrationBreadcrumbs]);

  return (
    <div className={styles.registrationPage}>
      <div className={styles.registrationPageCover} />
      {renderRegistration()}
    </div>
  );
};

export const RegistrationForAppsPage = connector(RegistrationForAppsPageComponent);
