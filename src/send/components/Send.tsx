import React from 'react';
import { InputAdornment, TextField } from '@mui/material';
import { connect, ConnectedProps } from 'react-redux';
import {
  Form, Formik, FormikHelpers, FormikProps,
} from 'formik';
import * as yup from 'yup';
import cn from 'classnames';
import { AddressApi, CryptoApi } from '@thepowereco/tssdk';
import { getTokenByID } from 'myAssets/selectors/tokensSelectors';
import { getWalletNativeTokensAmountByID } from 'myAssets/selectors/walletSelectors';
import { RouteComponentProps } from 'react-router';
import { TokenKind } from 'myAssets/types';
import { BigNumber } from '@ethersproject/bignumber';
import { t } from 'i18next';
import {
  Button, DeepPageTemplate, Divider, FullScreenLoader,
} from '../../common';
import { WalletRoutesEnum } from '../../application/typings/routes';
import { RootState } from '../../application/store';
import { getWalletAddress, getWalletData } from '../../account/selectors/accountSelectors';
import { LogoIcon, MoneyBugIcon } from '../../common/icons';
import ConfirmSendModal from './ConfirmSendModal';
import { getSentData } from '../selectors/sendSelectors';
import { checkIfLoading } from '../../network/selectors';
import { clearSentData, sendTokenTrxTrigger, sendTrxTrigger } from '../slices/sendSlice';
import styles from './Send.module.scss';
import TxResult from '../../common/txResult/TxResult';

type OwnProps = RouteComponentProps<{ type: TokenKind, address: string }>;

const mapDispatchToProps = {
  clearSentData,
};

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  address: getWalletAddress(state),
  sentData: getSentData(state),
  token: getTokenByID(state, props?.match?.params?.address),
  nativeTokenAmount: getWalletNativeTokensAmountByID(state, props?.match?.params?.address),
  tokenType: props?.match?.params?.type,
  tokenAddress: props?.match?.params?.address,
  loading: checkIfLoading(state, sendTrxTrigger.type) || checkIfLoading(state, sendTokenTrxTrigger.type),
  wif: getWalletData(state).wif,
});

const connector = connect(
  mapStateToProps,
  mapDispatchToProps,
);

type SendProps = ConnectedProps<typeof connector>;

type SendState = {
  openModal: boolean;
};

export type FormValues = {
  amount: string;
  comment: string;
  address: string;
};

const initialValues: FormValues = {
  amount: '',
  comment: '',
  address: '',
};

class Send extends React.Component<SendProps, SendState> {
  private InputLabelProps = {
    className: styles.label,
  };

  constructor(props: SendProps) {
    super(props);

    this.state = {
      openModal: false,
    };
  }

  componentWillUnmount() {
    this.props.clearSentData();
  }

  get isNativeToken() {
    return this.props.tokenType === 'native';
  }

  get formattedAmount() {
    const {
      nativeTokenAmount, token,
    } = this.props;
    const { isNativeToken } = this;
    const assetAmount = isNativeToken ? nativeTokenAmount : token?.amount;
    return typeof assetAmount === 'string'
      ? assetAmount
      : token && BigNumber.from(assetAmount).div(BigNumber.from(10).mul(token.decimals));
  }

  getValidationSchema = () => {
    const { formattedAmount } = this;

    return yup.object({
      amount: yup
        .number()
        .required()
        .moreThan(0)
        .lessThan(Number(formattedAmount?.toString()), t('balanceExceededReduceAmount')!)
        .nullable(),
      address: yup.string().required().length(20),
      comment: yup.string().max(1024),
    });
  };

  handleClose = () => this.setState({ openModal: false });

  handleSubmit = ({ address }: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
    if (!AddressApi.isTextAddressValid(address!)) {
      formikHelpers.setFieldError('address', t('invalidAddress')!);
    } else {
      this.setState({ openModal: true });
    }
  };

  onSubmit = async (values: FormValues, password: string) => {
    const { address, wif, token } = this.props;
    let decryptedWif;

    try {
      decryptedWif = await CryptoApi.decryptWif(wif, '');
    } catch (error) {
      decryptedWif = await CryptoApi.decryptWif(wif, password);
    }

    if (!token) {
      sendTrxTrigger({
        from: address,
        to: values.address!,
        comment: values.comment,
        amount: Number(values.amount)!,
        wif: decryptedWif,
      });
    } else {
      sendTokenTrxTrigger({
        address: token.address,
        amount: Number(values.amount),
        decimals: token.decimals,
        from: address,
        to: values.address!,
        wif: decryptedWif,
      });
    }
  };

  renderForm = (formikProps: FormikProps<typeof initialValues>) => {
    const {
      isNativeToken, props, onSubmit, handleClose,
    } = this;
    const { token } = props;

    return <>
      <ConfirmSendModal
        open={this.state.openModal}
        trxValues={formikProps.values}
        onClose={handleClose}
        token={token}
        onSubmit={onSubmit}

      />
      <Form className={styles.form}>
        <div className={styles.fields}>
          <TextField
            variant="standard"
            label={t('amount')}
            type="number"
            placeholder="00.000"
            name="amount"
            value={formikProps.values.amount}
            onChange={formikProps.handleChange}
            onBlur={formikProps.handleBlur}
            error={formikProps.touched.amount && Boolean(formikProps.errors.amount)}
            helperText={formikProps.touched.amount && formikProps.errors.amount}
            InputLabelProps={this.InputLabelProps}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MoneyBugIcon className={cn(formikProps.values.amount && styles.activeBugIcon)} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            variant="standard"
            label={t('addressOfTheRecipient')}
            placeholder="AA000000000000000000"
            name="address"
            value={formikProps.values.address}
            onChange={formikProps.handleChange}
            onBlur={formikProps.handleBlur}
            error={formikProps.touched.address && Boolean(formikProps.errors.address)}
            helperText={formikProps.touched.address && formikProps.errors.address}
          />
          <TextField
            disabled={!isNativeToken}
            variant="outlined"
            placeholder={t('addComment')!}
            multiline
            minRows={2}
            name="comment"
            value={formikProps.values.comment}
            onChange={formikProps.handleChange}
            onBlur={formikProps.handleBlur}
            error={formikProps.touched.comment && Boolean(formikProps.errors.comment)}
            helperText={formikProps.touched.comment && formikProps.errors.comment}
          />
        </div>
        <Button size="large" variant="filled" className={styles.button} type="submit" disabled={!formikProps.dirty}>
          {t('send')}
        </Button>
      </Form>
    </>;
  };

  render() {
    const {
      address,
      sentData,
      loading, token, tokenAddress,
    } = this.props;
    const { isNativeToken, formattedAmount } = this;
    const assetSymbol = isNativeToken ? tokenAddress : token?.symbol;
    const formattedAmountString = formattedAmount?.toString();
    if (loading) {
      return <FullScreenLoader />;
    }

    if (sentData) {
      return (
        <DeepPageTemplate
          topBarTitle={t('send')}
          backUrl={WalletRoutesEnum.myAssets}
          backUrlText={t('myAssets')!}
        >
          <TxResult sentData={{
            ...sentData,
            amount: `${sentData.amount} ${assetSymbol}`,
          }}
          />
        </DeepPageTemplate>
      );
    }

    return (
      <DeepPageTemplate topBarTitle={t('send')} backUrl={WalletRoutesEnum.myAssets} backUrlText={t('myAssets')!}>
        <div className={styles.content}>
          <div className={styles.walletInfo}>
            <span className={styles.titleBalance}>{t('totalBalance')}</span>
            <span className={styles.address}>{address}</span>
            <span className={styles.amount}>
              {isNativeToken && <LogoIcon width={20} height={20} className={styles.totalBalanceIcon} />}
              {formattedAmountString === '0' ? t('yourTokensWillBeHere') : `${formattedAmountString} ${assetSymbol}` }
            </span>
          </div>
          <Divider className={styles.divider} />
          <Formik
            validationSchema={this.getValidationSchema()}
            initialValues={initialValues}
            onSubmit={this.handleSubmit}
          >
            {this.renderForm}
          </Formik>
        </div>
      </DeepPageTemplate>
    );
  }
}

export default connector(Send);
