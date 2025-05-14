import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import appEnvs from 'appEnvs';
import { RoutesEnum } from 'application/typings/routes';
import { Button, LangMenu } from 'common';

import { objectToString } from 'sso/utils';
import styles from './WelcomePage.module.scss';

const WelcomePageComponent: FC = () => {
  const { t } = useTranslation();
  const { referrer } = useParams<{ referrer: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (referrer) {
      navigate(`${RoutesEnum.signup}/${referrer}`);
    }
  }, [navigate, referrer]);

  const stringData = objectToString({
    chainID: appEnvs.DEFAULT_CHAIN_ID
  });

  return (
    <div className={styles.registrationPage}>
      <div className={styles.controlsHolder}>
        <Button
          size='small'
          variant='outlined'
          type='button'
          to={RoutesEnum.signup}
        >
          {t('selectChain')}
        </Button>
        <LangMenu />
      </div>
      <Link to={RoutesEnum.root} className={styles.registrationTitle}>
        Power Wallet
      </Link>
      <div className={styles.registrationDesc}>{t('registrationPageDesc')}</div>
      <div className={styles.buttonsHolder}>
        <Button
          size='large'
          variant='contained'
          type='button'
          to={`${RoutesEnum.signup}/${stringData}`}
        >
          {t('registrationPageJoinButton')}
        </Button>
        <Button
          size='large'
          variant='outlined'
          type='button'
          to={RoutesEnum.login}
        >
          {t('registrationPageImportAccountButton')}
        </Button>
      </div>
    </div>
  );
};

export const WelcomePage = WelcomePageComponent;
