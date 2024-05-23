import React, { useCallback, useMemo } from 'react';
import { RootState } from 'application/store';
import { ConnectedProps, connect } from 'react-redux';
import { Button, WizardComponentProps } from 'common';
import { LogoIcon } from 'assets/icons';
import { useParams } from 'react-router';
import { objectToString, stringToObject } from 'sso/utils';
import { AppQueryParams } from 'application/typings/routes';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { useTranslation } from 'react-i18next';
import styles from './LoginToDapp.module.scss';

const mapStateToProps = (state: RootState) => ({
  walletAddress: getWalletAddress(state),
});

const connector = connect(mapStateToProps);

type LoginToDappProps = ConnectedProps<typeof connector> & WizardComponentProps;

const LoginToDappComponent: React.FC<LoginToDappProps> = ({
  walletAddress,
}) => {
  const { t } = useTranslation();

  const { data } = useParams<{ data?: string }>();

  const parsedData: AppQueryParams = useMemo(() => {
    if (data) return stringToObject(data);
    return null;
  }, [data]);

  const onClickLoginHandler = useCallback(() => {
    if (parsedData?.callbackUrl) {
      const stringData = objectToString({
        address: walletAddress,
        returnUrl: parsedData?.returnUrl,
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
        variant="contained"
        size="large"
        onClick={onClickLoginHandler}
      >
        {t('loginToDApp')}
      </Button>
    </div>
  );
};

export const LoginToDapp = connector(LoginToDappComponent);
