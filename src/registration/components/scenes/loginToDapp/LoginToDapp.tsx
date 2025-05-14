import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { AppQueryParams } from 'application/typings/routes';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { LogoIcon } from 'assets/icons';
import { Button, WizardComponentProps } from 'common';
import { objectToString, stringToObject } from 'sso/utils';
import styles from './LoginToDapp.module.scss';

type LoginToDappProps = WizardComponentProps;

const LoginToDappComponent: React.FC<LoginToDappProps> = () => {
  const { t } = useTranslation();
  const { activeWallet } = useWalletsStore();

  const { dataOrReferrer } = useParams<{ dataOrReferrer?: string }>();

  const parsedData: AppQueryParams = useMemo(() => {
    if (dataOrReferrer) return stringToObject(dataOrReferrer);
    return null;
  }, [dataOrReferrer]);

  const onClickLoginHandler = useCallback(() => {
    if (parsedData?.callbackUrl) {
      const stringData = objectToString({
        address: activeWallet?.address,
        returnUrl: parsedData?.returnUrl
      });
      window.opener.postMessage?.(
        objectToString({
          type: 'authenticateResponse',
          data: stringData
        }),
        parsedData.returnUrl
      );
      window.close();
      // window.location.replace(`${parsedData.callbackUrl}sso/${stringData}`);
    }
  }, [parsedData?.callbackUrl, parsedData?.returnUrl, activeWallet]);

  return (
    <div className={styles.content}>
      <div className={styles.title}>
        {t('youNowHaveAccessToTheDecentralizedWeb')}
      </div>
      <LogoIcon className={styles.logo} />
      <Button
        className={styles.button}
        variant='contained'
        size='large'
        onClick={onClickLoginHandler}
      >
        {t('loginToDApp')}
      </Button>
    </div>
  );
};

export const LoginToDapp = LoginToDappComponent;
