import React, { useCallback, useMemo } from 'react';
import { IconButton } from '@mui/material';
import { AddressApi } from '@thepowereco/tssdk';
import { waitForTransaction } from '@wagmi/core';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { parseUnits } from 'viem';
import {
  useAccount,
  useChainId,
  useDisconnect,
  useContractRead,
  useContractWrite,
  useSwitchNetwork
} from 'wagmi';
import * as yup from 'yup';
import abis from 'abis';
import appEnvs from 'appEnvs';
import { defaultEvmChain } from 'application/components/App';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { Button, OutlinedInput, PageTemplate, Select } from 'common';
import styles from './BuyCrypto.module.scss';

type InitialValues = {
  amount: number;
  address: string;
  token: string;
};

export const BuyCryptoPage: React.FC = () => {
  const modal = useWeb3Modal();
  const { address: userEvmAddress, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { activeWallet } = useWalletsStore();
  const initialValues = useMemo<InitialValues>(
    () => ({
      token: '',
      amount: 0,
      address: activeWallet?.address || ''
    }),
    [activeWallet?.address]
  );

  const { t } = useTranslation();
  const chain = useChainId();
  const { switchNetwork, isLoading: isSwitchNetworkLoading } =
    useSwitchNetwork();

  const validationSchema = useMemo(
    () =>
      yup.object({
        amount: yup
          .number()
          .required(t('requiredField'))
          .moreThan(0, t('amountMustBeMore'))
          .integer(t('onlyInteger')),
        address: yup
          .string()
          .required(t('requiredField'))
          .test(
            'test-address',
            t('invalidAddress'),
            (value) => !!value && AddressApi.isTextAddressValid(value)
          )
      }),
    [t]
  );

  const formik = useFormik({
    initialValues,
    onSubmit: handleSubmit,
    validationSchema
  });

  const isEnableOrWatched = Boolean(
    userEvmAddress &&
      formik.values.address &&
      formik.values.amount &&
      formik.values.token
  );

  const { data: tokenSell } = useContractRead({
    address: formik.values.token as `0x${string}`,
    abi: abis.swapEVM.abi,
    functionName: 'token_buy',
    enabled: isEnableOrWatched
  });

  console.log({ tokenSell, token: formik.values.token });
  const { data: stableDecimals } = useContractRead({
    address: tokenSell,
    abi: abis.erc20.abi,
    functionName: 'decimals',
    enabled: isEnableOrWatched
  });

  const { data: stableSymbol } = useContractRead({
    address: tokenSell,
    abi: abis.erc20.abi,
    functionName: 'symbol',
    enabled: isEnableOrWatched
  });

  const { data: stableBalance } = useContractRead({
    address: tokenSell,
    abi: abis.erc20.abi,
    functionName: 'balanceOf',
    args: [userEvmAddress!],
    enabled: isEnableOrWatched
  });

  const { data: stableAllowance, refetch: refetchStableAllowance } =
    useContractRead({
      address: tokenSell,
      abi: abis.erc20.abi,
      functionName: 'allowance',
      args: [userEvmAddress!, formik.values.token as `0x${string}`],
      enabled: isEnableOrWatched
    });

  const { writeAsync: approve } = useContractWrite({
    address: tokenSell,
    abi: abis.erc20.abi,
    functionName: 'approve'
  });

  const { writeAsync: buyAndBridge } = useContractWrite({
    address: formik.values.token as `0x${string}`,
    abi: abis.swapEVM.abi,
    functionName: 'buy_and_bridge'
  });

  const getIsEnoughUSDTAllowance = useCallback(
    (amount: number) =>
      !!stableDecimals &&
      !!stableAllowance &&
      parseUnits(amount.toString(), stableDecimals) <= stableAllowance,
    [stableAllowance, stableDecimals]
  );

  const getIsEnoughUSDTBalance = useCallback(
    (amount: number) =>
      !!stableDecimals &&
      !!stableBalance &&
      parseUnits(amount.toString(), stableDecimals) <= stableBalance,
    [stableBalance, stableDecimals]
  );

  async function handleSubmit({ amount, address, token }: InitialValues) {
    if (!AddressApi.isTextAddressValid(address)) return;

    const isEnoughUSDTAllowance = getIsEnoughUSDTAllowance(amount);
    const isEnoughUSDTBalance = getIsEnoughUSDTBalance(amount);

    if (isEnoughUSDTBalance && !isEnoughUSDTAllowance) {
      try {
        const { hash } = await approve({
          args: [
            token as `0x${string}`,
            parseUnits(amount.toString(), stableDecimals!)
          ]
        });

        const { status } = await waitForTransaction({ hash });
        if (status === 'success') {
          toast.success(`${t('approveSuccess')} ${amount} ${stableSymbol}`);
        } else {
          toast.error(`${t('approveError')} ${amount} ${stableSymbol}`);
        }
        toast.success(`${t('approveSuccess')} ${amount} ${stableSymbol}`);
        await refetchStableAllowance(); // Update the allowance state
      } catch (error) {
        toast.error(`${t('approveError')} ${amount} ${stableSymbol}`);
      }
    } else if (isEnoughUSDTBalance && isEnoughUSDTAllowance) {
      try {
        const { hash } = await buyAndBridge({
          args: [
            parseUnits(amount.toString(), stableDecimals!),
            parseUnits(amount.toString(), stableDecimals!),
            appEnvs.BRIDGE_EVM_CONTRACT_ADDRESS,
            AddressApi.textAddressToEvmAddress(address)
          ]
        });
        const { status } = await waitForTransaction({ hash });

        if (status === 'success') {
          toast.success(`${t('convertSuccess')} ${amount} ${stableSymbol}`);
        } else {
          toast.error(`${t('convertError')} ${amount} ${stableSymbol}`);
        }
      } catch (error) {
        toast.error(`${t('convertError')} ${amount} ${stableSymbol}`);
      }
    }
  }

  const onConnectHandler = useCallback(
    () => modal.open({ view: 'Connect' }) as any,
    [modal]
  );

  const onDisconnectHandler = () => disconnect();

  const renderBuyButton = useCallback(() => {
    if (!isConnected) {
      return (
        <Button onClick={onConnectHandler} variant='contained' fullWidth>
          {t('connectWallet')}
        </Button>
      );
    }

    if (chain !== defaultEvmChain.id) {
      return (
        <Button
          onClick={() => switchNetwork?.(defaultEvmChain.id)}
          variant='contained'
          fullWidth
          loading={isSwitchNetworkLoading}
        >
          {t('switchNetwork')}
        </Button>
      );
    }

    if (
      !getIsEnoughUSDTBalance(formik.values.amount) &&
      formik.values.amount > 0 &&
      !!formik.values.token
    ) {
      return (
        <Button fullWidth variant='contained' disabled>
          {t('insufficientBalance')}
        </Button>
      );
    }

    if (!getIsEnoughUSDTAllowance(formik.values.amount)) {
      return (
        <Button
          fullWidth
          type='submit'
          variant='contained'
          loading={formik.isSubmitting}
          disabled={!formik.isValid || !(formik.values.amount > 0)}
        >
          {t('approveAmount') +
            (formik.values?.amount
              ? ` ${formik.values.amount} ${stableSymbol}`
              : '')}
        </Button>
      );
    }

    return (
      <Button
        fullWidth
        type='submit'
        variant='contained'
        loading={formik.isSubmitting}
        disabled={!formik.isValid}
        color='success'
      >
        {t('Buy') +
          (formik.values?.amount
            ? ` ${formik.values.amount} ${stableSymbol}`
            : '')}
      </Button>
    );
  }, [
    isConnected,
    chain,
    getIsEnoughUSDTBalance,
    formik.values.amount,
    formik.values.token,
    formik.isSubmitting,
    formik.isValid,
    getIsEnoughUSDTAllowance,
    t,
    stableSymbol,
    onConnectHandler,
    isSwitchNetworkLoading,
    switchNetwork
  ]);

  return (
    <PageTemplate
      backUrl='/'
      backUrlText={t('home')!}
      topBarChild={t('deposit')}
    >
      <form className={styles.form} onSubmit={formik.handleSubmit}>
        {isConnected && (
          <IconButton className={styles.wallet} onClick={onDisconnectHandler}>
            {/* <LogInIcon /> */}
          </IconButton>
        )}
        <div className={styles.inputs}>
          <Select
            size='small'
            id='tokenSelect'
            label={t('token')}
            items={[
              {
                title: 'WSK',
                value: appEnvs.SWAP_WSK_EVM_CONTRACT_ADDRESS
              }
            ]}
            disabled={formik.isSubmitting}
            {...formik.getFieldProps('token')}
          />
          <OutlinedInput
            id='amount'
            label={t('amount')}
            placeholder={t('enterAmountPlaceholder')}
            type='number'
            size='small'
            errorMessage={formik.errors.amount}
            error={formik.touched.amount && Boolean(formik.errors.amount)}
            disabled={formik.isSubmitting}
            fullWidth
            {...formik.getFieldProps('amount')}
          />
          <OutlinedInput
            id='address'
            label={t('address')}
            placeholder={t('enterWalletAddressPlaceholder')}
            size='small'
            errorMessage={formik.errors.address}
            error={formik.touched.address && Boolean(formik.errors.address)}
            disabled={formik.isSubmitting}
            fullWidth
            {...formik.getFieldProps('address')}
          />
          {renderBuyButton()}
        </div>
      </form>
    </PageTemplate>
  );
};
