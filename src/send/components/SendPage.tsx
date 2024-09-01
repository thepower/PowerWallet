import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { BigNumber, formatFixed } from '@ethersproject/bignumber';
import { InputAdornment, TextField } from '@mui/material';
import { useStore } from '@tanstack/react-store';
import { AddressApi, CryptoApi } from '@thepowereco/tssdk';
import cn from 'classnames';
import { FormikHelpers, useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import * as yup from 'yup';
import { RootState } from 'application/reduxStore';
import { setSentData, store } from 'application/store';
import { WalletRoutesEnum } from 'application/typings/routes';
import { useWallets } from 'application/utils/localStorageUtils';
import { LogoIcon, MoneyBugIcon } from 'assets/icons';
import { Button, PageTemplate, Divider, FullScreenLoader } from 'common';
import TxResult from 'common/txResult/TxResult';
import { useWalletData } from 'myAssets/hooks/useWalletData';
import { getTokenByID } from 'myAssets/selectors/tokensSelectors';
import { addTokenTrigger } from 'myAssets/slices/tokensSlice';
import { TokenKind } from 'myAssets/types';
import { checkIfLoading } from 'network/selectors';
import { useSendErc721TokenTx } from 'send/hooks/useSendErc721TokenTx';
import { useSendTokenTx } from 'send/hooks/useSendTokenTx';
import { useSendTx } from 'send/hooks/useSendTx';
import ConfirmSendModal from './ConfirmSendModal';
import styles from './SendPage.module.scss';

const mapDispatchToProps = {
  addTokenTrigger
};

const mapStateToProps = (state: RootState) => ({
  getTokenByID: (address: string) => getTokenByID(state, address),
  isAddTokenLoading: checkIfLoading(state, addTokenTrigger.type)
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type SendProps = ConnectedProps<typeof connector>;

export type FormValues = {
  amount: number;
  comment: string;
  address: string;
};

const initialValues: FormValues = {
  amount: 0,
  comment: '',
  address: ''
};

const InputLabelProps = {
  className: styles.label
};

const SendPageComponent: FC<SendProps> = ({
  isAddTokenLoading,
  getTokenByID,
  addTokenTrigger
}) => {
  const { t } = useTranslation();
  const { activeWallet } = useWallets();
  const { sentData } = useStore(store);
  const [openModal, setOpenModal] = React.useState(false);
  const {
    type: tokenType,
    address: tokenAddress,
    id: erc721TokenId
  } = useParams<{
    type: TokenKind;
    address: string;
    id: string;
  }>();
  const { getNativeTokenAmountBySymbol } = useWalletData(activeWallet);
  const { sendTxMutation, isPending: isSendTxPending } = useSendTx({
    throwOnError: false
  });
  const { sendTokenTxMutation, isPending: isSendTokenTxPending } =
    useSendTokenTx({ throwOnError: false });

  const { sendErc721TokenTxMutation, isPending: isSendErc721TokenTxPending } =
    useSendErc721TokenTx({
      throwOnError: false
    });

  const token = useMemo(
    () => getTokenByID(tokenAddress!),
    [getTokenByID, tokenAddress]
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

  useEffect(() => {
    if (!token && tokenAddress && !isNativeToken) {
      addTokenTrigger({ address: tokenAddress, withoutRedirect: true });
    }
  }, [addTokenTrigger, isNativeToken, token, tokenAddress]);

  const formattedAmount = useMemo(() => {
    switch (tokenType) {
      case TokenKind.Erc20:
        return (
          token && formatFixed(BigNumber.from(token.amount), token.decimals)
        );
      case TokenKind.Native:
        return nativeTokenAmount;
      case TokenKind.Erc721:
        return token?.amount;
      default:
        return '0';
    }
  }, [tokenType, nativeTokenAmount, token]);

  const getValidationSchema = useCallback(() => {
    switch (tokenType) {
      case TokenKind.Native:
        return yup.object().shape({
          amount: yup
            .number()
            .required()
            .moreThan(0)
            .lessThan(
              Number(formattedAmount?.toString()),
              t('balanceExceededReduceAmount')!
            )
            .nullable(),
          address: yup.string().required().length(20),
          comment: yup.string().max(1024)
        });
      case TokenKind.Erc20:
        return yup.object().shape({
          amount: yup
            .number()
            .required()
            .moreThan(0)
            .lessThan(
              Number(formattedAmount?.toString()),
              t('balanceExceededReduceAmount')!
            )
            .nullable(),
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
          to: values.address!,
          address: tokenAddress!,
          id: erc721TokenId!,
          wif: decryptedWif
        });
        break;
      default:
    }
  };

  const handleSubmit = async (
    values: FormValues,
    formikHelpers: FormikHelpers<FormValues>
  ) => {
    if (!AddressApi.isTextAddressValid(values.address!)) {
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

  const renderForm = () => (
    <>
      <ConfirmSendModal
        open={openModal}
        trxValues={formik.values}
        onClose={handleClose}
        token={token}
        onSubmit={onSubmit}
      />
      <form className={styles.form} onSubmit={formik.handleSubmit}>
        <div className={styles.fields}>
          {!isErc721Token && (
            <TextField
              variant='standard'
              label={t('amount')}
              type='number'
              placeholder='00.000'
              name='amount'
              value={formik.values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.amount && Boolean(formik.errors.amount)}
              helperText={formik.touched.amount && formik.errors.amount}
              InputLabelProps={InputLabelProps}
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
            />
          )}
          <TextField
            variant='standard'
            label={t('addressOfTheRecipient')}
            placeholder='AA000000000000000000'
            name='address'
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.address && Boolean(formik.errors.address)}
            helperText={formik.touched.address && formik.errors.address}
          />
          {isNativeToken && (
            <TextField
              variant='outlined'
              placeholder={t('addComment')!}
              multiline
              minRows={2}
              name='comment'
              value={formik.values.comment}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.comment && Boolean(formik.errors.comment)}
              helperText={formik.touched.comment && formik.errors.comment}
            />
          )}
        </div>
        <Button
          size='large'
          variant='contained'
          className={styles.button}
          type='submit'
          disabled={!formik.dirty}
        >
          {t('send')}
        </Button>
      </form>
    </>
  );

  const tokenSymbol = isNativeToken ? tokenAddress : token?.symbol;
  const formattedAmountString = formattedAmount?.toString();

  if (
    isSendTxPending ||
    isSendTokenTxPending ||
    isSendErc721TokenTxPending ||
    isAddTokenLoading
  ) {
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
          <span className={styles.address}>{activeWallet?.address || '-'}</span>
          <span className={styles.amount}>
            {isNativeToken && (
              <LogoIcon
                width={20}
                height={20}
                className={styles.totalBalanceIcon}
              />
            )}
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
export const SendPage = connector(SendPageComponent);
