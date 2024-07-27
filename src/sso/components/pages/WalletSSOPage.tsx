import { FC, useEffect, useMemo } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RouteComponentProps, useHistory } from 'react-router';

import { getWalletAddress } from 'account/selectors/accountSelectors';
import { RootState } from 'application/store';
import { AppQueryParams, WalletRoutesEnum } from 'application/typings/routes';
import { objectToString, stringToObject } from 'sso/utils';

type OwnProps = RouteComponentProps<{ data?: string }>;

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  data: props.match.params.data,
  address: getWalletAddress(state)
});

const connector = connect(mapStateToProps);

type WalletSSOProps = ConnectedProps<typeof connector>;

const WalletSSOPage: FC<WalletSSOProps> = ({ data, address }) => {
  const h = useHistory();
  const parsedData: AppQueryParams = useMemo(() => {
    if (data) return stringToObject(data);
    return null;
  }, [data]);

  useEffect(() => {
    if (!address) {
      h.push(WalletRoutesEnum.signup);
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
