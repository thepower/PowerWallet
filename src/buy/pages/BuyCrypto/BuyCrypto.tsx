import React, { useCallback, useMemo } from 'react';
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
  useContractWrite,
  useSwitchNetwork,
  useContractReads,
  useNetwork
} from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import * as yup from 'yup';
import abis from 'abis';
import appEnvs from 'appEnvs';
import { defaultEvmChain } from 'application/components/App';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { Button, OutlinedInput, PageTemplate, Select } from 'common';
import styles from './BuyCrypto.module.scss';

enum Token {
  WSK = 'WSK',
  TOY = 'TOY',
  USDCoy = 'USDCoy',
  USDtoy18 = 'USDtoy18'
}

type InitialValues = {
  chainId: number;
  amount: number;
  address: string;
  tokenPay: Token;
  tokenBuy: Token;
};

type TokenPair = `${string}-${string}`;

const swapsMap: Record<number, Record<TokenPair, `0x${string}`>> = {
  [bscTestnet.id]: {
    [`${Token.TOY}-${Token.WSK}`]: appEnvs.SWAP_TOY_TO_WSK_EVM_CONTRACT_ADDRESS,
    [`${Token.USDCoy}-${Token.WSK}`]:
      appEnvs.SWAP_USDCoy_TO_WSK_EVM_CONTRACT_ADDRESS,
    [`${Token.USDtoy18}-${Token.WSK}`]:
      appEnvs.SWAP_USDtoy18_TO_WSK_EVM_CONTRACT_ADDRESS
  }
};

const bridgeMap: Record<number, Record<TokenPair, `0x${string}`>> = {
  [bscTestnet.id]: {
    [`${Token.WSK}-${Token.WSK}`]: appEnvs.WSK_EVM_CONTRACT_ADDRESS,
    [`${Token.TOY}-${Token.TOY}`]: appEnvs.TOY_EVM_CONTRACT_ADDRESS,
    [`${Token.USDCoy}-${Token.USDCoy}`]: appEnvs.USDCoy_EVM_CONTRACT_ADDRESS,
    [`${Token.USDtoy18}-${Token.USDtoy18}`]:
      appEnvs.USDtoy18_EVM_CONTRACT_ADDRESS
  }
};

type TokenOption = {
  title: Token;
  value: Token;
};

const tokens: TokenOption[] = [
  {
    title: Token.USDtoy18,
    value: Token.USDtoy18
  },
  {
    title: Token.USDCoy,
    value: Token.USDCoy
  },
  {
    title: Token.WSK,
    value: Token.WSK
  }
];

export const BuyCryptoPage: React.FC = () => {
  const modal = useWeb3Modal();
  const { address: userEvmAddress, isConnected } = useAccount();
  const { activeWallet } = useWalletsStore();
  const { chains } = useNetwork();
  const initialValues = useMemo<InitialValues>(
    () => ({
      chainId: defaultEvmChain.id,
      tokenPay: tokens[0].value,
      tokenBuy: tokens[2].value,
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
        tokenPay: yup.string().required(t('required')),
        tokenBuy: yup.string().required(t('required')),
        amount: yup
          .number()
          .required(t('required'))
          .moreThan(0, t('amountMustBeMore'))
          .integer(t('onlyInteger')),
        address: yup
          .string()
          .required(t('required'))
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

  const isBridge = formik.values.tokenPay === formik.values.tokenBuy;
  const swapAddress =
    swapsMap[formik.values.chainId][
      `${formik.values.tokenPay}-${formik.values.tokenBuy}`
    ];

  const bridgeTokenAddress =
    bridgeMap[formik.values.chainId][
      `${formik.values.tokenPay}-${formik.values.tokenBuy}`
    ];

  const isEnableOrWatched = Boolean(
    userEvmAddress &&
      formik.values.address &&
      formik.values.amount &&
      formik.values.tokenPay &&
      formik.values.tokenBuy
  );

  const { data: swapData } = useContractReads({
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
      },
      {
        address: swapAddress,
        abi: abis.swapEVM.abi,
        functionName: 'calc',
        args: [BigInt(formik.values.amount), BigInt(formik.values.amount)]
      }
    ],
    enabled: isEnableOrWatched && !isBridge
  });

  const tokenPay = swapData?.[0].result;
  const tokenBuy = swapData?.[1].result;
  const calculatedResultAmount = swapData?.[2].result?.[1];

  const { data: tokenPayData, refetch: refetchTokenPayData } = useContractReads(
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
          args: [
            userEvmAddress!,
            isBridge ? appEnvs.BRIDGE_EVM_CONTRACT_ADDRESS : swapAddress
          ]
        }
      ],
      enabled: Boolean(isEnableOrWatched && (tokenPay || bridgeTokenAddress))
    }
  );

  const tokenPayDecimals = tokenPayData?.[0].result as number;
  const tokenPaySymbol = tokenPayData?.[1].result as string;
  const tokenPayBalance = tokenPayData?.[2].result as bigint;
  const tokenPayAllowance = tokenPayData?.[3].result as bigint;

  const { data: tokenBuyData } = useContractReads({
    contracts: [
      // {
      //   address: tokenBuy,
      //   abi: abis.erc20.abi,
      //   functionName: 'decimals'
      // },
      {
        address: tokenBuy,
        abi: abis.erc20.abi,
        functionName: 'symbol'
      }
      // {
      //   address: tokenBuy,
      //   abi: abis.erc20.abi,
      //   functionName: 'balanceOf',
      //   args: [userEvmAddress!]
      // },
      // {
      //   address: tokenBuy,
      //   abi: abis.erc20.abi,
      //   functionName: 'allowance',
      //   args: [userEvmAddress!, swapAddress]
      // }
    ],
    enabled: Boolean(isEnableOrWatched && tokenBuy && !isBridge)
  });

  // const tokenBuyDecimals = tokenBuyData?.[0].result as number;
  const tokenBuySymbol = tokenBuyData?.[0].result as string;
  // const tokenBuyBalance = tokenBuyData?.[2].result as bigint;
  // const tokenBuyAllowance = tokenBuyData?.[3].result as bigint;

  const { writeAsync: approve } = useContractWrite({
    address: isBridge ? bridgeTokenAddress : tokenPay,
    abi: abis.erc20.abi,
    functionName: 'approve'
  });

  const { writeAsync: buyAndBridge } = useContractWrite({
    address: swapAddress,
    abi: abis.swapEVM.abi,
    functionName: 'buy_and_bridge'
  });

  const { writeAsync: convertToken } = useContractWrite({
    address: appEnvs.BRIDGE_EVM_CONTRACT_ADDRESS,
    abi: abis.bridgeEVM.abi,
    functionName: 'convert_token'
  });

  const getIsEnoughUSDTAllowance = useCallback(
    (amount: number) =>
      !!tokenPayDecimals &&
      !!tokenPayAllowance &&
      parseUnits(amount.toString(), tokenPayDecimals) <= tokenPayAllowance,
    [tokenPayAllowance, tokenPayDecimals]
  );

  const getIsEnoughUSDTBalance = useCallback(
    (amount: number) =>
      !!tokenPayDecimals &&
      !!tokenPayBalance &&
      parseUnits(amount.toString(), tokenPayDecimals) <= tokenPayBalance,
    [tokenPayBalance, tokenPayDecimals]
  );

  async function handleSubmit({ amount, address }: InitialValues) {
    if (!AddressApi.isTextAddressValid(address)) return;

    const isEnoughUSDTAllowance = getIsEnoughUSDTAllowance(amount);
    const isEnoughUSDTBalance = getIsEnoughUSDTBalance(amount);

    if (isEnoughUSDTBalance && !isEnoughUSDTAllowance) {
      try {
        const { hash } = await approve({
          args: [
            isBridge ? appEnvs.BRIDGE_EVM_CONTRACT_ADDRESS : swapAddress,
            parseUnits(amount.toString(), tokenPayDecimals!)
          ]
        });

        const { status } = await waitForTransaction({ hash });
        if (status === 'success') {
          toast.success(`${t('approveSuccess')} ${amount} ${tokenPaySymbol}`);
        } else {
          toast.error(`${t('approveError')} ${amount} ${tokenPaySymbol}`);
        }
        toast.success(`${t('approveSuccess')} ${amount} ${tokenPaySymbol}`);
        await refetchTokenPayData();
      } catch (error) {
        toast.error(`${t('approveError')} ${amount} ${tokenPaySymbol}`);
      }
    } else if (isEnoughUSDTBalance && isEnoughUSDTAllowance) {
      try {
        if (isBridge) {
          const { hash } = await convertToken({
            args: [
              bridgeTokenAddress,
              AddressApi.textAddressToEvmAddress(address),
              parseUnits(amount.toString(), tokenPayDecimals!),
              '0x0000000000000000000000000000000000000000'
            ]
          });
          const { status } = await waitForTransaction({ hash });

          if (status === 'success') {
            toast.success(`${t('convertSuccess')} ${amount} ${tokenPaySymbol}`);
          } else {
            toast.error(`${t('convertError')} ${amount} ${tokenPaySymbol}`);
          }
        } else {
          const { hash } = await buyAndBridge({
            args: [
              parseUnits(amount.toString(), tokenPayDecimals!),
              parseUnits(amount.toString(), tokenPayDecimals!),
              appEnvs.BRIDGE_EVM_CONTRACT_ADDRESS,
              AddressApi.textAddressToEvmAddress(address),
              '0x0000000000000000000000000000000000000000'
            ]
          });
          const { status } = await waitForTransaction({ hash });

          if (status === 'success') {
            toast.success(`${t('convertSuccess')} ${amount} ${tokenPaySymbol}`);
          } else {
            toast.error(`${t('convertError')} ${amount} ${tokenPaySymbol}`);
          }
        }
      } catch (error) {
        toast.error(`${t('convertError')} ${amount} ${tokenPaySymbol}`);
      }
    }
  }

  const onConnectHandler = useCallback(
    () => modal.open({ view: 'Connect' }) as any,
    [modal]
  );

  const renderBuyButton = useCallback(() => {
    if (!isConnected) {
      return (
        <Button onClick={onConnectHandler} variant='contained' fullWidth>
          {t('connectWallet')}
        </Button>
      );
    }

    if (chain !== formik.values.chainId) {
      return (
        <Button
          onClick={() => switchNetwork?.(formik.values.chainId)}
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
      !!formik.values.tokenBuy &&
      !!formik.values.tokenPay
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
              ? ` ${formik.values.amount} ${tokenPaySymbol}`
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
        {isBridge
          ? t('Bridge') +
            (formik.values?.amount
              ? ` ${formik.values.amount} ${tokenPaySymbol}`
              : '')
          : t('Buy and bridge') +
            (calculatedResultAmount
              ? ` ${calculatedResultAmount} ${tokenBuySymbol} for ${formik.values.amount} ${tokenPaySymbol}`
              : '')}
      </Button>
    );
  }, [
    isConnected,
    chain,
    formik.values,
    formik.isSubmitting,
    formik.isValid,
    getIsEnoughUSDTBalance,
    getIsEnoughUSDTAllowance,
    isBridge,
    t,
    tokenPaySymbol,
    calculatedResultAmount,
    tokenBuySymbol,
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
          <div className={styles.wallet}>
            <w3m-account-button />
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
              items={tokens}
              disabled={formik.isSubmitting}
              {...formik.getFieldProps('tokenPay')}
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
                  : tokens
              }
              disabled={formik.isSubmitting}
              {...formik.getFieldProps('tokenBuy')}
            />
          </div>

          <OutlinedInput
            id='amount'
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
