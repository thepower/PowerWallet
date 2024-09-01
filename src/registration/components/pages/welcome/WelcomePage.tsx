import { FC, useEffect } from 'react';
import { push } from 'connected-react-router';
import { useTranslation } from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { RootState } from 'application/reduxStore';
import { WalletRoutesEnum } from 'application/typings/routes';
import { Button, LangMenu } from 'common';
import {
  getCurrentBackupStep,
  getCurrentCreatingStep,
  getIsWithoutPassword
} from 'registration/selectors/registrationSelectors';

import styles from './WelcomePage.module.scss';

const mapStateToProps = (state: RootState) => ({
  creatingStep: getCurrentCreatingStep(state),
  backupStep: getCurrentBackupStep(state),
  isWithoutPassword: getIsWithoutPassword(state)
});

const mapDispatchToProps = {
  routeTo: push
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type WelcomePageProps = ConnectedProps<typeof connector>;

const WelcomePageComponent: FC<WelcomePageProps> = ({ routeTo }) => {
  const { t } = useTranslation();
  const { referrer } = useParams<{ referrer: string }>();

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
          size='large'
          variant='contained'
          type='button'
          to={WalletRoutesEnum.signup}
        >
          {t('registrationPageJoinButton')}
        </Button>
        <Button
          size='large'
          variant='outlined'
          type='button'
          to={WalletRoutesEnum.login}
        >
          {t('registrationPageImportAccountButton')}
        </Button>
      </div>
    </div>
  );
};

export const WelcomePage = connector(WelcomePageComponent);
