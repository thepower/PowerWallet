import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { AddressApi } from '@thepowereco/tssdk';
import { waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { useFormik } from 'formik';
import { round } from 'lodash';
import Countdown from 'react-countdown';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatUnits, parseUnits } from 'viem';
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useReadContracts,
  useChains,
  useConfig,
  useReadContract
} from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import * as yup from 'yup';
import abis from 'abis';
import appEnvs from 'appEnvs';
import { defaultEvmChain } from 'application/components/App';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { LineChart } from 'buy/components/LineChart';
import { useDeboucedKeccak256, useGetPriceData } from 'buy/hooks';
import { Button, OutlinedInput, PageTemplate, Select } from 'common';

import styles from './BuyCrypto.module.scss';

enum ChainId {
  c3 = 3,
  c100501 = 100501
}

enum Token {
  WSK = 'WSK',
  USDC = 'USDC',
  USDT = 'USDT'
}

type InitialValues = {
  chainId: number;
  amountPay: number;
  amountBuy: number;
  address: string;
  tokenPay: Token;
  tokenBuy: Token;
  lastTouch: 'tokenPay' | 'tokenBuy';
  promoCode: string;
};

type TokenPair = `${string}-${string}`;

const swapsMap: Record<string, Record<TokenPair, `0x${string}`>> = {
  [`${bscTestnet.id}-${ChainId.c3}`]: {
    [`${Token.USDC}-${Token.WSK}`]:
      appEnvs.C97_C3_SWAP_USDC_TO_SK_EVM_CONTRACT_ADDRESS,
    [`${Token.USDT}-${Token.WSK}`]:
      appEnvs.C97_C3_SWAP_USDT_TO_SK_EVM_CONTRACT_ADDRESS
  },
  [`${bsc.id}-${ChainId.c100501}`]: {
    [`${Token.USDC}-${Token.WSK}`]:
      appEnvs.C56_C100501_SWAP_USDC_TO_SK_EVM_CONTRACT_ADDRESS,
    [`${Token.USDT}-${Token.WSK}`]:
      appEnvs.C56_C100501_SWAP_USDT_TO_SK_EVM_CONTRACT_ADDRESS
  }
};

const bridgeTokensMap: Record<string, Record<TokenPair, `0x${string}`>> = {
  [`${bscTestnet.id}-${ChainId.c3}`]: {
    [`${Token.WSK}-${Token.WSK}`]: appEnvs.C97_WSK_EVM_CONTRACT_ADDRESS,
    [`${Token.USDC}-${Token.USDC}`]: appEnvs.C97_USDC_EVM_CONTRACT_ADDRESS,
    [`${Token.USDT}-${Token.USDT}`]: appEnvs.C97_USDT_EVM_CONTRACT_ADDRESS
  },
  [`${bsc.id}-${ChainId.c100501}`]: {
    [`${Token.WSK}-${Token.WSK}`]: appEnvs.C97_WSK_EVM_CONTRACT_ADDRESS,
    [`${Token.USDC}-${Token.USDC}`]: appEnvs.C97_USDC_EVM_CONTRACT_ADDRESS,
    [`${Token.USDT}-${Token.USDT}`]: appEnvs.C97_USDT_EVM_CONTRACT_ADDRESS
  }
};

const bridgeMap: Record<string, `0x${string}`> = {
  [`${bscTestnet.id}-${ChainId.c3}`]:
    appEnvs.C97_C3_BRIDGE_EVM_CONTRACT_ADDRESS,
  [`${bsc.id}-${ChainId.c100501}`]:
    appEnvs.C56_C100501_BRIDGE_EVM_CONTRACT_ADDRESS
};

type TokenOption = {
  title: Token;
  value: Token;
};

const payTokens: TokenOption[] = [
  {
    title: Token.USDT,
    value: Token.USDT
  }
  // {
  //   title: Token.USDC,
  //   value: Token.USDC
  // },
  // {
  //   title: Token.WSK,
  //   value: Token.WSK
  // }
];

const buyTokens: TokenOption[] = [
  // {
  //   title: Token.USDT,
  //   value: Token.USDT
  // },
  // {
  //   title: Token.USDC,
  //   value: Token.USDC
  // },
  {
    title: Token.WSK,
    value: Token.WSK
  }
];

export const BuyCryptoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const promoCode = searchParams.get?.('promoCode');
  const [offerEndTime, setOfferEndTime] = useState<number | null>(null);

  const [targetTime, setTargetTime] = useState(() =>
    BigInt(Math.floor(Date.now() / 1000) + 300)
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      // Если хотите, чтобы +5 мин считались заново от текущего момента:
      setTargetTime(now + 300n);
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

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
      address: activeWallet?.address || '',
      promoCode: promoCode || ''
    }),
    [activeWallet?.address, promoCode]
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
          .moreThan(0, t('amountMustBeMore'))
          .required(t('required')),
        amountBuy: yup
          .number()
          .moreThan(0, t('amountMustBeMore'))
          .required(t('required')),
        address: yup
          .string()
          .required(t('required'))
          .test(
            'test-address',
            t('invalidAddress'),
            (value) => !!value && AddressApi.isTextAddressValid(value)
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

  const promoCodeKeccak256 = useDeboucedKeccak256(formik.values.promoCode);

  const isBridge = formik.values.tokenPay === formik.values.tokenBuy;

  const swapAddress =
    swapsMap?.[`${formik.values.chainId}-${activeWallet?.chainId}`]?.[
      `${formik.values.tokenPay}-${formik.values.tokenBuy}`
    ];

  const bridgeTokenAddress =
    bridgeTokensMap?.[`${formik.values.chainId}-${activeWallet?.chainId}`]?.[
      `${formik.values.tokenPay}-${formik.values.tokenBuy}`
    ];

  const bridgeAddress =
    bridgeMap?.[`${formik.values.chainId}-${activeWallet?.chainId}`];

  const isBridgeIsNotAvailable = !Boolean(
    isBridge ? bridgeTokenAddress : swapAddress
  );

  const isEnableOrWatched = Boolean(
    userEvmAddress &&
      formik.values.address &&
      formik.values.tokenPay &&
      formik.values.tokenBuy
    //  &&
    // (formik.values.amountPay || formik.values.amountBuy)
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

  const { data: tokenPayData, refetch: refetchTokenPayData } = useReadContracts(
    {
      contracts: [
        {
          address: isBridge ? bridgeTokenAddress : tokenPay,
          abi: abis.erc20.abi,
          functionName: 'decimals'
        },
        {
          address: isBridge ? bridgeTokenAddress : tokenPay,
          abi: abis.erc20.abi,
          functionName: 'symbol'
        },
        {
          address: isBridge ? bridgeTokenAddress : tokenPay,
          abi: abis.erc20.abi,
          functionName: 'balanceOf',
          args: [userEvmAddress!]
        },
        {
          address: isBridge ? bridgeTokenAddress : tokenPay,
          abi: abis.erc20.abi,
          functionName: 'allowance',
          args: [userEvmAddress!, isBridge ? bridgeTokenAddress : swapAddress]
        }
      ],
      query: {
        enabled: Boolean(isEnableOrWatched && (tokenPay || bridgeTokenAddress))
      }
    }
  );

  const tokenPayDecimals = tokenPayData?.[0].result as number;
  const tokenPaySymbol = tokenPayData?.[1].result as string;
  const tokenPayBalance = tokenPayData?.[2].result as bigint;
  const tokenPayAllowance = tokenPayData?.[3].result as bigint;

  const { data: calc } = useReadContract({
    address: swapAddress,
    abi: abis.swapEVM.abi,
    functionName: 'calc',
    args: [parseUnits('1', tokenPayDecimals!), promoCodeKeccak256, targetTime],
    query: {
      enabled: isEnableOrWatched && !isBridge
    }
  });

  const tokenPrice = useMemo(() => {
    if (calc && calc.length === 2) {
      const amountPay = formatUnits(calc[0], tokenPayDecimals!);
      const amountBuy = formatUnits(calc[1], tokenPayDecimals!);

      return round(Number(amountPay) / Number(amountBuy), 6);
    }

    return 0;
  }, [calc, tokenPayDecimals]);

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
      }
    ],
    query: {
      enabled: Boolean(isEnableOrWatched && tokenBuy && !isBridge)
    }
  });

  const tokenBuySymbol = tokenBuyData?.[0].result as string;

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

  async function handleSubmit({ amountPay, address }: InitialValues) {
    if (!AddressApi.isTextAddressValid(address)) return;

    const isEnoughUSDTAllowance = getIsEnoughTokenAllowance(amountPay);
    const isEnoughUSDTBalance = getIsEnoughTokenBalance(amountPay);

    if (isEnoughUSDTBalance && !isEnoughUSDTAllowance) {
      try {
        const hash = await writeContract(config, {
          address: isBridge ? bridgeTokenAddress : tokenPay!,
          abi: abis.erc20.abi,
          functionName: 'approve',
          args: [
            isBridge ? bridgeAddress : swapAddress,
            parseUnits(amountPay.toString(), tokenPayDecimals!)
          ]
        });
        const { status } = await waitForTransactionReceipt(config, {
          confirmations: 2,
          hash
        });
        if (status === 'success') {
          toast.success(
            `${t('approveSuccess')} ${amountPay} ${tokenPaySymbol}`
          );
        } else {
          toast.error(`${t('approveError')} ${amountPay} ${tokenPaySymbol}`);
        }
        toast.success(`${t('approveSuccess')} ${amountPay} ${tokenPaySymbol}`);
        await refetchTokenPayData();
      } catch (error) {
        toast.error(`${t('approveError')} ${amountPay} ${tokenPaySymbol}`);
      }
    } else if (isEnoughUSDTBalance && isEnoughUSDTAllowance) {
      try {
        if (isBridge) {
          const hash = await writeContract(config, {
            address: bridgeAddress,
            abi: abis.bridgeEVM.abi,
            functionName: 'convert_token',
            args: [
              bridgeTokenAddress,
              AddressApi.textAddressToEvmAddress(address),
              parseUnits(amountPay.toString(), tokenPayDecimals!),
              '0x0000000000000000000000000000000000000000'
            ]
          });
          const { status } = await waitForTransactionReceipt(config, {
            confirmations: 2,
            hash
          });

          if (status === 'success') {
            toast.success(
              `${t('convertSuccess')} ${amountPay} ${tokenPaySymbol}`
            );
          } else {
            toast.error(`${t('convertError')} ${amountPay} ${tokenPaySymbol}`);
          }
        } else {
          const hash = await writeContract(config, {
            address: swapAddress,
            abi: abis.swapEVM.abi,
            functionName: 'buy_and_bridge',
            args: [
              parseUnits(amountPay.toString(), tokenPayDecimals!),
              parseUnits(amountPay.toString(), tokenPayDecimals!),
              bridgeAddress,
              AddressApi.textAddressToEvmAddress(address),
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
              `${t('convertSuccess')} ${amountPay} ${tokenPaySymbol}`
            );
          } else {
            toast.error(`${t('convertError')} ${amountPay} ${tokenPaySymbol}`);
          }
        }
        formik.resetForm();
      } catch (error) {
        toast.error(`${t('convertError')} ${amountPay} ${tokenPaySymbol}`);
      }
    }
  }

  const onConnectHandler = useCallback(
    () => modal.open({ view: 'Connect' }),
    [modal]
  );

  const renderBuyButton = useCallback(() => {
    if (isBridgeIsNotAvailable) {
      return (
        <Button
          variant='contained'
          fullWidth
          disabled
          className={styles.submitButton}
        >
          {t('bridgeIsNotAvailable')}
        </Button>
      );
    }

    if (!isConnected) {
      return (
        <Button
          onClick={onConnectHandler}
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
          onClick={() => switchChainAsync?.({ chainId: formik.values.chainId })}
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
      +formik.values.amountPay > 0 &&
      !!formik.values.tokenBuy &&
      !!formik.values.tokenPay
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
              ? ` ${formik.values.amountPay} ${tokenPaySymbol}`
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
  }, [
    isBridgeIsNotAvailable,
    isConnected,
    chain,
    formik.values.chainId,
    formik.values.amountPay,
    formik.values.tokenBuy,
    formik.values.tokenPay,
    formik.isSubmitting,
    formik.isValid,
    getIsEnoughTokenBalance,
    getIsEnoughTokenAllowance,
    isBridge,
    t,
    tokenPaySymbol,
    onConnectHandler,
    isSwitchNetworkLoading,
    switchChainAsync
  ]);

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

  const renderOfferAvailable = useCallback(() => {
    return (
      <>
        <div className={styles.specialOffer__timeLeft}>
          {offerEndTime ? (
            <Countdown
              date={offerEndTime}
              onComplete={handleCountdownComplete}
            />
          ) : (
            t('loading')
          )}
        </div>
        <div className={styles.specialOffer__subtitle}>
          {t('offerAvailable')}
        </div>
      </>
    );
  }, [handleCountdownComplete, offerEndTime, t]);

  return (
    <PageTemplate
      backUrl='/'
      backUrlText={t('home')!}
      topBarChild={t('deposit')}
    >
      <form className={styles.form} onSubmit={formik.handleSubmit}>
        {isConnected && formik.values.promoCode && (
          <>
            <div className={styles.specialOffer}>
              <div className={styles.specialOffer__tittle}>{t('heyThere')}</div>
              <div className={styles.specialOffer__text}>
                {t('specialPersonalOffer')}
              </div>
              <div className={styles.specialOffer__price}>
                {`${tokenPrice} ${tokenPaySymbol}` || t('loading')}
              </div>
              <div className={styles.specialOffer__subtitle}>
                {t('tokenPrice')}
              </div>
              {renderOfferAvailable()}
              <div className={styles.specialOffer__allocation}>
                {priceData?.availableAllocation
                  ? `${priceData?.availableAllocation} ${tokenBuySymbol}`
                  : t('loading')}
              </div>
              <div className={styles.specialOffer__subtitle}>
                {t('availableAllocation')}
              </div>
              <div className={styles.specialOffer__tip}>
                {t('discountedTokensPromo')}
              </div>
            </div>
            <LineChart data={priceData?.data ? priceData.data : []} />
          </>
        )}
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
          {renderBuyButton()}
        </div>
      </form>
    </PageTemplate>
  );
};
