import { FC, useEffect, useMemo } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useParams, useNavigate } from 'react-router';

import { getWalletAddress } from 'account/selectors/accountSelectors';
import { RootState } from 'application/reduxStore';
import { AppQueryParams, WalletRoutesEnum } from 'application/typings/routes';
import { objectToString, stringToObject } from 'sso/utils';

const mapStateToProps = (state: RootState) => ({
  address: getWalletAddress(state)
});

const connector = connect(mapStateToProps);

type WalletSSOProps = ConnectedProps<typeof connector>;

const WalletSSOPage: FC<WalletSSOProps> = ({ address }) => {
  const { data } = useParams<{ data: string }>();

  const navigate = useNavigate();
  const parsedData: AppQueryParams = useMemo(() => {
    if (data) return stringToObject(data);
    return null;
  }, [data]);

  useEffect(() => {
    if (!address) {
      navigate(WalletRoutesEnum.signup);
    } else {
      const stringData = objectToString({
        address,
        returnUrl: parsedData?.returnUrl
      });
      if (parsedData?.callbackUrl) {
        window.location.replace(`${parsedData.callbackUrl}sso/${stringData}`);
      }
    }
  });

  return null;
};

export default connector(WalletSSOPage);
