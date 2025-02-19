import { useQuery } from '@tanstack/react-query';
import { AddressApi } from '@thepowereco/tssdk';
import axios from 'axios';
import isEmpty from 'lodash/isEmpty';
import appEnvs from 'appEnvs';
import { appQueryKeys } from 'application/queryKeys';
import { useWalletsStore } from 'application/utils/localStorageUtils';

type OrderData = { [key: string]: any };
type OrderParams = {
  chainid: number;
  address: string;
  data: OrderData;
};

export const useCreateNewOrder = (orderData: OrderData) => {
  const { activeWallet } = useWalletsStore();

  const {
    data: signedOrder,
    isLoading,
    isSuccess
  } = useQuery({
    queryKey: appQueryKeys.newOrder(activeWallet?.address),
    queryFn: () => {
      return axios.post<OrderParams>(`${appEnvs.ITEZ_API_URL}/new_order`, {
        chainid: 97,
        address:
          activeWallet?.address &&
          `0x${AddressApi.textAddressToHex(activeWallet.address)}`,
        dst_chainid: activeWallet?.chainId,
        data: orderData
      });
    },
    enabled: Boolean(activeWallet?.address && !isEmpty(orderData)),
    select: (data) => data?.data
  });

  return {
    signedOrder,
    isLoading,
    isSuccess
  };
};
