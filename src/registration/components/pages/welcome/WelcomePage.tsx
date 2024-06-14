import { Button, LangMenu } from 'common';
import { push } from 'connected-react-router';
import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';
import { RootState } from 'application/store';
import {
  getCurrentBackupStep,
  getCurrentCreatingStep,
  getIsWithoutPassword,
} from 'registration/selectors/registrationSelectors';
import { Link, RouteComponentProps } from 'react-router-dom';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { WalletRoutesEnum } from 'application/typings/routes';

import styles from './WelcomePage.module.scss';

type OwnProps = RouteComponentProps<{ referrer?: string }>;

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  referrer: props?.match?.params?.referrer,
  walletAddress: getWalletAddress(state),
  creatingStep: getCurrentCreatingStep(state),
  backupStep: getCurrentBackupStep(state),
  isWithoutPassword: getIsWithoutPassword(state),
});

const mapDispatchToProps = {
  routeTo: push,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type WelcomePageProps = ConnectedProps<typeof connector>;

const WelcomePageComponent: FC<WelcomePageProps> = ({ routeTo, referrer }) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (referrer) {
      routeTo(`${WalletRoutesEnum.signup}/${referrer}`);
    }
  }, [referrer, routeTo]);

  return (
    <div className={styles.registrationPage}>
      <LangMenu className={styles.langSelect} />
      <Link to={WalletRoutesEnum.root} className={styles.registrationTitle}>
        Power Wallet
      </Link>
      <div className={styles.registrationDesc}>{t('registrationPageDesc')}</div>
      <div className={styles.buttonsHolder}>
        <Button
          size="large"
          variant="contained"
          type="button"
          to={WalletRoutesEnum.signup}
        >
          {t('registrationPageJoinButton')}
        </Button>
        <Button
          size="large"
          variant="outlined"
          type="button"
          to={WalletRoutesEnum.login}
        >
          {t('registrationPageImportAccountButton')}
        </Button>
      </div>
    </div>
  );
};

export const WelcomePage = connector(WelcomePageComponent);
