import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';
import { useParams } from 'react-router';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { RootState } from 'application/store';
import { AppQueryParams } from 'application/typings/routes';
import { LogoIcon } from 'assets/icons';
import { Button, WizardComponentProps } from 'common';
import { objectToString, stringToObject } from 'sso/utils';
import styles from './LoginToDapp.module.scss';

const mapStateToProps = (state: RootState) => ({
  walletAddress: getWalletAddress(state)
});

const connector = connect(mapStateToProps);

type LoginToDappProps = ConnectedProps<typeof connector> & WizardComponentProps;

const LoginToDappComponent: React.FC<LoginToDappProps> = ({
  walletAddress
}) => {
  const { t } = useTranslation();

  const { dataOrReferrer } = useParams<{ dataOrReferrer?: string }>();

  const parsedData: AppQueryParams = useMemo(() => {
    if (dataOrReferrer) return stringToObject(dataOrReferrer);
    return null;
  }, [dataOrReferrer]);

  const onClickLoginHandler = useCallback(() => {
    if (parsedData?.callbackUrl) {
      const stringData = objectToString({
        address: walletAddress,
        returnUrl: parsedData?.returnUrl
      });
      window.location.replace(`${parsedData.callbackUrl}sso/${stringData}`);
    }
  }, [parsedData?.callbackUrl, parsedData?.returnUrl, walletAddress]);

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

export const LoginToDapp = connector(LoginToDappComponent);
