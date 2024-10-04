import { FC, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';

import { AppQueryParams, WalletRoutesEnum } from 'application/typings/routes';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { objectToString, stringToObject } from 'sso/utils';

const WalletSSOPageComponent: FC = () => {
  const { data } = useParams<{ data: string }>();
  const { activeWallet } = useWalletsStore();
  const navigate = useNavigate();
  const parsedData: AppQueryParams = useMemo(() => {
    if (data) return stringToObject(data);
    return null;
  }, [data]);

  useEffect(() => {
    if (!activeWallet?.address) {
      navigate(WalletRoutesEnum.signup);
    } else {
      const stringData = objectToString({
        address: activeWallet.address,
        returnUrl: parsedData?.returnUrl
      });
      if (parsedData?.callbackUrl) {
        window.location.replace(`${parsedData.callbackUrl}sso/${stringData}`);
      }
    }
  });

  return null;
};

export const WalletSSOPage = WalletSSOPageComponent;
