import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { AddressApi } from '@thepowereco/tssdk';
import { Config, waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { useFormik } from 'formik';
import { TFunction } from 'i18next';
import { round } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { isAddress, parseUnits } from 'viem';
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useReadContracts,
  useChains,
  useConfig,
  useWatchAsset
} from 'wagmi';
import * as yup from 'yup';
import abis from 'abis';
import appEnvs from 'appEnvs';
import { defaultEvmChain } from 'application/components/App';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { ActionButton } from 'buy/components/ActionButton/ActionButton';
import { SpecialOffer } from 'buy/components/SpecialOffer/SpecialOffer';
import {
  bridgeMap,
  bridgeTokensMap,
  buyTokens,
  payTokens,
  swapsMap
} from 'buy/constants';
import {
  useDeboucedKeccak256,
  useGetPriceData,
  useTokenPrice
} from 'buy/hooks';
import { useTargetTime } from 'buy/hooks/useTargetTime';
import { useTokenData } from 'buy/hooks/useTokenData';
import { InitialValues, Token, TokenData } from 'buy/types';
import { Button, OutlinedInput, PageTemplate, Select } from 'common';

import styles from './BuyCrypto.module.scss';

export const handleSubmitTransaction = async (
  config: Config,
  values: InitialValues,
  tokenData: TokenData,
  isBridge: boolean,
  swapAddress: `0x${string}`,
  bridgeAddress: `0x${string}`,
  bridgeTokenAddress: `0x${string}`,
  promoCodeKeccak256: `0x${string}`,
  t: TFunction
): Promise<void> => {
  const { amountPay, address } = values;

  try {
    if (isBridge) {
      const hash = await writeContract(config, {
        address: bridgeAddress,
        abi: abis.bridgeEVM.abi,
        functionName: 'convert_token',
        args: [
          bridgeTokenAddress,
          isAddress(address)
            ? address
            : AddressApi.textAddressToEvmAddress(address),
          parseUnits(amountPay.toString(), tokenData.decimals),
          '0x0000000000000000000000000000000000000000'
        ]
      });

      const { status } = await waitForTransactionReceipt(config, {
        confirmations: 2,
        hash
      });

      if (status === 'success') {
        toast.success(
          `${t('convertSuccess')} ${amountPay} ${tokenData.symbol}`
        );
      } else {
        toast.error(`${t('convertError')} ${amountPay} ${tokenData.symbol}`);
      }
    } else {
      const hash = await writeContract(config, {
        address: swapAddress,
        abi: abis.swapEVM.abi,
        functionName: 'buy_and_bridge',
        args: [
          parseUnits(amountPay.toString(), tokenData.decimals),
          parseUnits(amountPay.toString(), tokenData.decimals),
          bridgeAddress,
          isAddress(address)
            ? address
            : AddressApi.textAddressToEvmAddress(address),
          '0x0000000000000000000000000000000000000000',
          promoCodeKeccak256
        ]
      });

      const { status } = await waitForTransactionReceipt(config, {
        confirmations: 2,
        hash
      });

      if (status === 'success') {
        toast.success(
          `${t('convertSuccess')} ${amountPay} ${tokenData.symbol}`
        );

        // watchAsset(config, {

        // })
      } else {
        toast.error(`${t('convertError')} ${amountPay} ${tokenData.symbol}`);
      }
    }
  } catch (error) {
    toast.error(`${t('convertError')} ${amountPay} ${tokenData.symbol}`);
    throw error;
  }
};

export const handleApproveTransaction = async (
  config: Config,
  values: InitialValues,
  tokenData: TokenData,
  isBridge: boolean,
  swapAddress: `0x${string}`,
  bridgeAddress: `0x${string}`,
  bridgeTokenAddress: `0x${string}`,
  tokenPay: `0x${string}`,
  t: TFunction
): Promise<void> => {
  const { amountPay } = values;

  try {
    const hash = await writeContract(config, {
      address: isBridge ? bridgeTokenAddress : tokenPay!,
      abi: abis.erc20.abi,
      functionName: 'approve',
      args: [
        isBridge ? bridgeAddress : swapAddress,
        parseUnits(amountPay.toString(), tokenData.decimals)
      ]
    });

    const { status } = await waitForTransactionReceipt(config, {
      confirmations: 2,
      hash
    });

    if (status === 'success') {
      toast.success(`${t('approveSuccess')} ${amountPay} ${tokenData.symbol}`);
    } else {
      toast.error(`${t('approveError')} ${amountPay} ${tokenData.symbol}`);
    }
  } catch (error) {
    toast.error(`${t('approveError')} ${amountPay} ${tokenData.symbol}`);
    throw error;
  }
};

export const BuyCryptoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const promoCode = searchParams.get?.('promoCode');
  const [offerEndTime, setOfferEndTime] = useState<number | null>(null);

  const targetTime = useTargetTime();
  const config = useConfig();
  const modal = useAppKit();
  const { address: userEvmAddress, isConnected } = useAccount();
  const { activeWallet } = useWalletsStore();
  const chains = useChains();
  const initialValues = useMemo<InitialValues>(
    () => ({
      chainId: defaultEvmChain.id,
      tokenPay: payTokens[0].value,
      tokenBuy: buyTokens[0].value,
      amountPay: 0,
      amountBuy: 0,
      lastTouch: 'tokenPay',
      address: activeWallet?.address || userEvmAddress || '',
      promoCode: promoCode || ''
    }),
    [activeWallet?.address, promoCode, userEvmAddress]
  );

  const { t } = useTranslation();
  const chain = useChainId();
  const { switchChainAsync, isPending: isSwitchNetworkLoading } =
    useSwitchChain();

  const validationSchema = useMemo(
    () =>
      yup.object({
        tokenPay: yup.string().required(t('required')),
        tokenBuy: yup.string().required(t('required')),
        amountPay: yup
          .number()
          .transform((value) => (Number.isNaN(value) ? null : value))
          .moreThan(0, t('amountMustBeMore'))
          .nullable()
          .required(t('required')),
        amountBuy: yup
          .number()
          .transform((value) => (Number.isNaN(value) ? null : value))
          .nullable()
          .moreThan(0, t('amountMustBeMore'))
          .required(t('required')),
        address: yup
          .string()
          .required(t('required'))
          .test(
            'test-address',
            t('invalidAddress'),
            (value) =>
              !!value &&
              (AddressApi.isTextAddressValid(value) || isAddress(value))
          ),
        promoCode: yup.string()
      }),
    [t]
  );

  const formik = useFormik({
    initialValues,
    onSubmit: handleSubmit,
    validationSchema
  });

  useEffect(() => {
    if (!activeWallet && userEvmAddress) {
      formik.setFieldValue('address', userEvmAddress);
    }
  }, [userEvmAddress]);

  const promoCodeKeccak256 = useDeboucedKeccak256(formik.values.promoCode);

  const isBridge = formik.values.tokenPay === formik.values.tokenBuy;

  const swapAddress =
    swapsMap?.[
      `${formik.values.chainId}-${
        activeWallet?.chainId || appEnvs.DEFAULT_CHAIN_ID
      }`
    ]?.[`${formik.values.tokenPay}-${formik.values.tokenBuy}`];

  const bridgeTokenAddress =
    bridgeTokensMap?.[
      `${formik.values.chainId}-${
        activeWallet?.chainId || appEnvs.DEFAULT_CHAIN_ID
      }`
    ]?.[`${formik.values.tokenPay}-${formik.values.tokenBuy}`];

  const bridgeAddress =
    bridgeMap?.[
      `${formik.values.chainId}-${
        activeWallet?.chainId || appEnvs.DEFAULT_CHAIN_ID
      }`
    ];

  const isEnableOrWatched = Boolean(
    formik.values.tokenPay && formik.values.tokenBuy
  );

  const { data: swapData } = useReadContracts({
    contracts: [
      {
        address: swapAddress,
        abi: abis.swapEVM.abi,
        functionName: 'token_pay'
      },
      {
        address: swapAddress,
        abi: abis.swapEVM.abi,
        functionName: 'token_buy'
      }
    ],
    query: {
      enabled: isEnableOrWatched && !isBridge
    }
  });

  const tokenPay = swapData?.[0].result;
  const tokenBuy = swapData?.[1].result;

  const tokenPayData = useTokenData(
    isBridge ? bridgeTokenAddress : tokenPay,
    userEvmAddress,
    isBridge ? bridgeAddress : swapAddress,
    isEnableOrWatched
  );

  const tokenPayDecimals = tokenPayData?.decimals;
  const tokenPaySymbol = tokenPayData?.symbol;
  const tokenPayBalance = tokenPayData?.balance;
  const tokenPayAllowance = tokenPayData?.allowance;

  const { tokenPrice } = useTokenPrice({
    isBridge,
    swapAddress,
    tokenPayDecimals,
    promoCodeKeccak256,
    targetTime,
    isEnableOrWatched
  });

  const { watchAssetAsync } = useWatchAsset();

  const handleAmountPayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    formik.setFieldValue('amountPay', value);
    formik.setFieldValue('lastTouch', 'tokenPay');
  };

  const handleAmountBuyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    formik.setFieldValue('amountBuy', value);
    formik.setFieldValue('lastTouch', 'tokenBuy');
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (!tokenPrice) return;

      const { amountPay, amountBuy, lastTouch } = formik.values;

      if (lastTouch === 'tokenPay' && amountPay > 0) {
        formik.setFieldValue(
          'amountBuy',
          round(amountPay / tokenPrice, 6),
          false
        );
      } else if (lastTouch === 'tokenBuy' && amountBuy > 0) {
        formik.setFieldValue(
          'amountPay',
          round(amountBuy * tokenPrice, 6),
          false
        );
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [
    formik.values.amountPay,
    formik.values.amountBuy,
    formik.values.lastTouch,
    tokenPrice
  ]);

  const { data: tokenBuyData } = useReadContracts({
    contracts: [
      {
        address: tokenBuy,
        abi: abis.erc20.abi,
        functionName: 'symbol'
      },
      {
        address: tokenBuy,
        abi: abis.erc20.abi,
        functionName: 'decimals'
      }
    ],
    query: {
      enabled: Boolean(isEnableOrWatched && tokenBuy && !isBridge)
    }
  });

  const tokenBuySymbol = tokenBuyData?.[0].result;
  const tokenBuyDecimals = tokenBuyData?.[1].result;

  const getIsEnoughTokenAllowance = useCallback(
    (amount: number) =>
      !!tokenPayDecimals &&
      !!tokenPayAllowance &&
      parseUnits(amount.toString(), tokenPayDecimals) <= tokenPayAllowance,
    [tokenPayAllowance, tokenPayDecimals]
  );

  const getIsEnoughTokenBalance = useCallback(
    (amount: number) =>
      !!tokenPayDecimals &&
      !!tokenPayBalance &&
      parseUnits(amount.toString(), tokenPayDecimals) <= tokenPayBalance,
    [tokenPayBalance, tokenPayDecimals]
  );

  async function handleSubmit(values: InitialValues) {
    const isEnoughTokenAllowance = getIsEnoughTokenAllowance(values.amountPay);
    const isEnoughTokenBalance = getIsEnoughTokenBalance(values.amountPay);

    if (isEnoughTokenBalance && !isEnoughTokenAllowance) {
      await handleApproveTransaction(
        config,
        values,
        tokenPayData,
        isBridge,
        swapAddress!,
        bridgeAddress!,
        bridgeTokenAddress!,
        tokenPay!,
        t
      );
      await tokenPayData.refetch();
    } else if (isEnoughTokenBalance && isEnoughTokenAllowance) {
      await handleSubmitTransaction(
        config,
        values,
        tokenPayData,
        isBridge,
        swapAddress!,
        bridgeAddress!,
        bridgeTokenAddress!,
        promoCodeKeccak256,
        t
      );
      // if (!activeWallet) {
      await switchChainAsync({
        chainId: chains[appEnvs.DEFAULT_CHAIN_ID].id
      });
      await watchAssetAsync({
        type: 'ERC20',
        options: {
          address: tokenBuy!,
          symbol: tokenBuySymbol!,
          decimals: tokenBuyDecimals!
        }
      });
      // }
      formik.resetForm();
    }
  }

  const { priceData, refetch: refetchPriceData } = useGetPriceData({
    promoCodeKeccak256,
    swapAddress
  });

  const handleCountdownComplete = useCallback(() => {
    setOfferEndTime(null);
    refetchPriceData();
  }, [refetchPriceData]);

  useEffect(() => {
    if (priceData?.offerAvailable && !offerEndTime) {
      setOfferEndTime(Date.now() + priceData.offerAvailable * 1000);
    }
  }, [priceData?.offerAvailable]);

  const isBridgeIsNotAvailable = !Boolean(
    isBridge ? bridgeTokenAddress : swapAddress
  );

  return (
    <PageTemplate
      backUrl='/'
      backUrlText={t('home')!}
      topBarChild={t('deposit')}
    >
      <form className={styles.form} onSubmit={formik.handleSubmit}>
        <SpecialOffer
          onCountdownComplete={handleCountdownComplete}
          priceData={priceData}
          tokenBuySymbol={tokenBuySymbol}
          tokenPaySymbol={tokenPaySymbol}
          tokenPrice={tokenPrice}
        />
        {isConnected && (
          <div className={styles.wallet}>
            <appkit-button />
          </div>
        )}
        <div className={styles.inputs}>
          <Select
            size='small'
            id='chainId'
            label={t('chain')}
            items={chains.map((chain) => ({
              title: chain.name,
              value: chain.id
            }))}
            disabled={formik.isSubmitting}
            {...formik.getFieldProps('chainId')}
          />
          <div className={styles.selectsSet}>
            <Select
              size='small'
              id='tokenSelect'
              label={t('token')}
              items={payTokens}
              disabled={formik.isSubmitting}
              {...formik.getFieldProps('tokenPay')}
            />
            <OutlinedInput
              id='amountPay'
              placeholder={t('enterAmountPayPlaceholder')}
              size='small'
              type='number'
              errorMessage={formik.errors.amountPay}
              error={
                formik.touched.amountPay && Boolean(formik.errors.amountPay)
              }
              disabled={formik.isSubmitting}
              fullWidth
              {...formik.getFieldProps('amountPay')}
              onChange={handleAmountPayChange}
            />
            <Select
              size='small'
              id='tokenSelect'
              label={t('token')}
              items={
                formik.values.tokenPay === Token.WSK
                  ? [
                      {
                        title: Token.WSK,
                        value: Token.WSK
                      }
                    ]
                  : buyTokens
              }
              disabled={formik.isSubmitting}
              {...formik.getFieldProps('tokenBuy')}
            />
            <OutlinedInput
              id='amountBuy'
              placeholder={t('enterAmountPlaceholder')}
              size='small'
              type='number'
              errorMessage={formik.errors.amountBuy}
              error={
                formik.touched.amountBuy && Boolean(formik.errors.amountBuy)
              }
              disabled={formik.isSubmitting}
              fullWidth
              {...formik.getFieldProps('amountBuy')}
              onChange={handleAmountBuyChange}
            />
          </div>
          <OutlinedInput
            id='address'
            placeholder={t('enterWalletAddressPlaceholder')}
            size='small'
            errorMessage={formik.errors.address}
            error={formik.touched.address && Boolean(formik.errors.address)}
            disabled={formik.isSubmitting}
            fullWidth
            {...formik.getFieldProps('address')}
          />
          <OutlinedInput
            id='promoCode'
            placeholder={t('enterPromoCodePlaceholder')}
            size='small'
            errorMessage={formik.errors.promoCode}
            error={formik.touched.promoCode && Boolean(formik.errors.promoCode)}
            disabled={formik.isSubmitting}
            fullWidth
            {...formik.getFieldProps('promoCode')}
          />
          {!isBridgeIsNotAvailable ? (
            <ActionButton
              formik={formik}
              isConnected={isConnected}
              chain={chain}
              tokenData={tokenPayData}
              isBridge={isBridge}
              onConnect={() => modal.open({ view: 'Connect' })}
              onSwitchChain={switchChainAsync}
              isSwitchNetworkLoading={isSwitchNetworkLoading}
            />
          ) : (
            <Button
              variant='contained'
              fullWidth
              disabled
              className={styles.submitButton}
            >
              {t('bridgeIsNotAvailable')}
            </Button>
          )}
        </div>
      </form>
    </PageTemplate>
  );
};
