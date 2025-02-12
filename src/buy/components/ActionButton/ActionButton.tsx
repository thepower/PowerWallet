import { useCallback } from 'react';
import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { parseUnits } from 'viem';
import { Config } from 'wagmi';
import { SwitchChainMutateAsync } from 'wagmi/query';
import { InitialValues, TokenData } from 'buy/types';
import { Button } from 'common';

import styles from './ActionButton.module.scss';

interface ActionButtonProps {
  formik: FormikProps<InitialValues>;
  isConnected: boolean;
  chain: number;
  tokenData: TokenData;
  isBridge: boolean;
  onConnect: () => void;
  onSwitchChain: SwitchChainMutateAsync<Config, unknown>;
  isSwitchNetworkLoading: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  formik,
  isConnected,
  chain,
  tokenData,
  isBridge,
  onConnect,
  onSwitchChain,
  isSwitchNetworkLoading
}) => {
  const { t } = useTranslation();

  const getIsEnoughTokenBalance = useCallback(
    (amount: number) =>
      !!tokenData.decimals &&
      !!tokenData.balance &&
      parseUnits(amount.toString(), tokenData.decimals) <= tokenData.balance,
    [tokenData.balance, tokenData.decimals]
  );

  const getIsEnoughTokenAllowance = useCallback(
    (amount: number) =>
      !!tokenData.decimals &&
      !!tokenData.allowance &&
      parseUnits(amount.toString(), tokenData.decimals) <= tokenData.allowance,
    [tokenData.allowance, tokenData.decimals]
  );

  if (!isConnected) {
    return (
      <Button
        onClick={onConnect}
        variant='contained'
        fullWidth
        className={styles.submitButton}
      >
        {t('connectWallet')}
      </Button>
    );
  }

  if (chain !== formik.values.chainId) {
    return (
      <Button
        onClick={() => onSwitchChain({ chainId: formik.values.chainId })}
        variant='contained'
        fullWidth
        loading={isSwitchNetworkLoading}
        className={styles.submitButton}
      >
        {t('switchNetwork')}
      </Button>
    );
  }

  if (
    !getIsEnoughTokenBalance(formik.values.amountPay) &&
    +formik.values.amountPay > 0
  ) {
    return (
      <Button
        fullWidth
        variant='contained'
        className={styles.submitButton}
        disabled
      >
        {t('insufficientBalance')}
      </Button>
    );
  }

  if (!getIsEnoughTokenAllowance(formik.values.amountPay)) {
    return (
      <Button
        fullWidth
        type='submit'
        variant='contained'
        loading={formik.isSubmitting}
        disabled={!formik.isValid || !(+formik.values.amountPay > 0)}
        className={styles.submitButton}
      >
        {t('approveAmount') +
          (formik.values?.amountPay
            ? ` ${formik.values.amountPay} ${tokenData.symbol}`
            : '')}
      </Button>
    );
  }

  return (
    <Button
      type='submit'
      variant='contained'
      loading={formik.isSubmitting}
      disabled={!formik.isValid}
      className={styles.submitButton}
    >
      {isBridge ? t('Bridge') : t('Buy and bridge')}
    </Button>
  );
};
