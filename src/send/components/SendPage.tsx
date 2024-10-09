import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { InputAdornment, TextField } from '@mui/material';
import { AddressApi, CryptoApi } from '@thepowereco/tssdk';
import cn from 'classnames';
import { FormikHelpers, useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import * as yup from 'yup';
import { useStore } from 'application/store';
import { WalletRoutesEnum } from 'application/typings/routes';
import {
  useTokensStore,
  useWalletsStore
} from 'application/utils/localStorageUtils';
import { LogoIcon, MoneyBugIcon } from 'assets/icons';
import { Button, PageTemplate, Divider, FullScreenLoader } from 'common';
import TxResult from 'common/txResult/TxResult';
import { useAddToken } from 'myAssets/hooks/useAddToken';
import { useTokenBalance } from 'myAssets/hooks/useTokenBalance';
import { useWalletData } from 'myAssets/hooks/useWalletData';
import { TokenKind } from 'myAssets/types';
import { useSendErc721TokenTx, useSendTokenTx, useSendTx } from 'send/hooks';
import ConfirmSendModal from './ConfirmSendModal';
import styles from './SendPage.module.scss';

export type FormValues = {
  amount: string;
  comment: string;
  address: string;
};

const initialValues: FormValues = {
  amount: '0',
  comment: '',
  address: ''
};

const InputLabelProps = {
  className: styles.label
};

const SendPageComponent: FC = () => {
  const { t } = useTranslation();
  const { activeWallet } = useWalletsStore();
  const { sentData, setSentData } = useStore();
  const [openModal, setOpenModal] = useState(false);
  const {
    type: tokenType,
    address: tokenAddress,
    id: erc721TokenId
  } = useParams<{ type: TokenKind; address: string; id: string }>();

  const { getNativeTokenAmountBySymbol } = useWalletData(activeWallet);
  const { sendTxMutation, isPending: isSendTxPending } = useSendTx({
    throwOnError: false
  });
  const { sendTokenTxMutation, isPending: isSendTokenTxPending } =
    useSendTokenTx({ throwOnError: false });
  const { sendErc721TokenTxMutation, isPending: isSendErc721TokenTxPending } =
    useSendErc721TokenTx({ throwOnError: false });
  const { getTokenByAddress } = useTokensStore();
  const { addTokenMutation, isPending: isAddTokenLoading } = useAddToken({
    throwOnError: false
  });
  const token = useMemo(
    () => getTokenByAddress(tokenAddress),
    [getTokenByAddress, tokenAddress]
  );
  const nativeTokenAmount = getNativeTokenAmountBySymbol(tokenAddress);

  useEffect(() => {
    setSentData(null);
  }, []);

  const isNativeToken = useMemo(
    () => tokenType === TokenKind.Native,
    [tokenType]
  );
  const isErc721Token = useMemo(
    () => tokenType === TokenKind.Erc721,
    [tokenType]
  );

  const { tokenBalance } = useTokenBalance({ tokenAddress, type: tokenType });

  useEffect(() => {
    if (!token && tokenAddress && !isNativeToken) {
      addTokenMutation({ address: tokenAddress, withoutRedirect: true });
    }
  }, [addTokenMutation, isNativeToken, token, tokenAddress]);

  const formattedAmount = useMemo(() => {
    switch (tokenType) {
      case TokenKind.Erc20:
      case TokenKind.Erc721:
        return tokenBalance;
      case TokenKind.Native:
        return nativeTokenAmount;
      default:
        return '0';
    }
  }, [tokenType, tokenBalance, nativeTokenAmount]);

  const getValidationSchema = useCallback(() => {
    const amountValidation = yup
      .number()
      .required()
      .moreThan(0)
      .lessThan(Number(formattedAmount), t('balanceExceededReduceAmount')!)
      .nullable();

    switch (tokenType) {
      case TokenKind.Native:
        return yup.object().shape({
          amount: amountValidation,
          address: yup.string().required().length(20),
          comment: yup.string().max(1024)
        });
      case TokenKind.Erc20:
        return yup.object().shape({
          amount: amountValidation,
          address: yup.string().required().length(20)
        });
      case TokenKind.Erc721:
        return yup.object().shape({
          address: yup.string().required().length(20)
        });
      default:
        return undefined;
    }
  }, [formattedAmount, t, tokenType]);

  const handleClose = () => setOpenModal(false);

  const send = async ({
    values,
    decryptedWif
  }: {
    values: FormValues;
    decryptedWif: string;
  }) => {
    switch (tokenType) {
      case TokenKind.Native:
        sendTxMutation({
          to: values.address!,
          comment: values.comment,
          amount: values.amount,
          wif: decryptedWif
        });
        break;
      case TokenKind.Erc20:
        if (token) {
          sendTokenTxMutation({
            address: token.address,
            amount: values.amount,
            decimals: token.decimals,
            to: values.address!,
            wif: decryptedWif
          });
        }
        break;
      case TokenKind.Erc721:
        sendErc721TokenTxMutation({
          to: values.address,
          address: tokenAddress!,
          id: erc721TokenId!,
          wif: decryptedWif
        });
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (
    values: FormValues,
    formikHelpers: FormikHelpers<FormValues>
  ) => {
    if (!AddressApi.isTextAddressValid(values.address)) {
      formikHelpers.setFieldError('address', t('invalidAddress')!);
    } else {
      try {
        if (!activeWallet) {
          throw new Error('Wallet not found');
        }
        const decryptedWif = CryptoApi.decryptWif(
          activeWallet.encryptedWif,
          ''
        );
        await send({ values, decryptedWif });
      } catch (error) {
        setOpenModal(true);
      }
    }
  };
  const onSubmit = async (values: FormValues, password: string) => {
    if (!activeWallet) {
      throw new Error('Wallet not found');
    }

    const decryptedWif = CryptoApi.decryptWif(
      activeWallet.encryptedWif,
      password
    );

    await send({ values, decryptedWif });
  };

  const formik = useFormik({
    initialValues,
    onSubmit: handleSubmit,
    validationSchema: getValidationSchema()
  });

  const isPending = useMemo(
    () => isSendTxPending || isSendTokenTxPending || isSendErc721TokenTxPending,
    [isSendTxPending, isSendTokenTxPending, isSendErc721TokenTxPending]
  );

  const renderForm = () => (
    <>
      {token && (
        <ConfirmSendModal
          open={openModal}
          trxValues={formik.values}
          onClose={handleClose}
          token={token}
          onSubmit={onSubmit}
        />
      )}
      <form className={styles.form} onSubmit={formik.handleSubmit}>
        <div className={styles.fields}>
          {!isErc721Token && (
            <TextField
              variant='standard'
              label={t('amount')}
              placeholder='00.000'
              error={formik.touched.amount && Boolean(formik.errors.amount)}
              helperText={formik.touched.amount && formik.errors.amount}
              InputLabelProps={InputLabelProps}
              disabled={isPending}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <MoneyBugIcon
                      className={cn(
                        formik.values.amount && styles.activeBugIcon
                      )}
                    />
                  </InputAdornment>
                )
              }}
              {...formik.getFieldProps('amount')}
            />
          )}
          <TextField
            variant='standard'
            label={t('addressOfTheRecipient')}
            placeholder='AA000000000000000000'
            error={formik.touched.address && Boolean(formik.errors.address)}
            helperText={formik.touched.address && formik.errors.address}
            disabled={isPending}
            {...formik.getFieldProps('address')}
          />
          {isNativeToken && (
            <TextField
              variant='outlined'
              placeholder={t('addComment')!}
              multiline
              minRows={2}
              error={formik.touched.comment && Boolean(formik.errors.comment)}
              helperText={formik.touched.comment && formik.errors.comment}
              disabled={isPending}
              {...formik.getFieldProps('comment')}
            />
          )}
        </div>
        <Button
          size='large'
          variant='contained'
          className={styles.button}
          type='submit'
          loading={isPending}
          disabled={!formik.isValid || formik.isSubmitting || !formik.dirty}
        >
          {t('send')}
        </Button>
      </form>
    </>
  );

  const tokenSymbol = isNativeToken ? tokenAddress : token?.symbol;
  const formattedAmountString = formattedAmount?.toString();

  if (isAddTokenLoading) {
    return <FullScreenLoader />;
  }

  if (sentData) {
    return (
      <PageTemplate
        topBarChild={t('send')}
        backUrl={WalletRoutesEnum.root}
        backUrlText={t('home')!}
      >
        <TxResult
          sentData={{
            ...sentData,
            amount: `${sentData.amount} ${tokenSymbol}`
          }}
        />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      topBarChild={t('send')}
      backUrl={WalletRoutesEnum.root}
      backUrlText={t('home')!}
    >
      <div className={styles.content}>
        <div className={styles.walletInfo}>
          <span className={styles.titleBalance}>{t('totalBalance')}</span>
          <span className={styles.address}>{`${activeWallet?.chainId} - ${
            activeWallet?.address || '-'
          }`}</span>
          <span className={styles.amount}>
            {isNativeToken && <LogoIcon className={styles.totalBalanceIcon} />}
            {formattedAmountString === '0'
              ? t('yourTokensWillBeHere')
              : `${formattedAmountString} ${tokenSymbol}`}
          </span>
        </div>
        <Divider className={styles.divider} />
        {renderForm()}
      </div>
    </PageTemplate>
  );
};

export const SendPage = SendPageComponent;
