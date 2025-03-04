import { useState, useEffect, FC, useMemo } from 'react';
import { AddressApi, CryptoApi, TransactionsApi } from '@thepowereco/tssdk';
import cn from 'classnames';
import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { bytesToString, formatUnits, hexToBytes, isAddress } from 'viem/utils';

import { useConfirmModalPromise } from 'application/hooks';
import { useNetworkApi } from 'application/hooks/useNetworkApi';

import { useStore } from 'application/store';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { Button, FullScreenLoader, TxResult } from 'common';
import CardTable from 'common/cardTable/CardTable';
import CardTableKeyAccordion from 'common/cardTableKeyAccordion/CardTableKeyAccordion';
import { useSignAndSendTx } from 'send/hooks/useSignAndSendTx';

import { TxBody, TxKindByName, TxPurpose } from 'sign-and-send/typing';
import { objectToString, stringToObject } from 'sso/utils';
import styles from './SingAndSendPage.module.scss';
import { ThePowerLogoIcon } from './ThePowerLogoIcon';

const { autoAddFee, autoAddGas } = TransactionsApi;

const txKindMap: { [key: number]: string } = Object.entries(
  TxKindByName
).reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

const SignAndSendPageComponent: FC = () => {
  const { t } = useTranslation();
  const { message } = useParams<{ message: string }>();
  const { activeWallet, wallets, setActiveWalletByAddress } = useWalletsStore();
  const { networkApi } = useNetworkApi({ chainId: activeWallet?.chainId });

  const { signAndSendTxMutation, isPending } = useSignAndSendTx({
    throwOnError: true
  });

  const { confirm } = useConfirmModalPromise();

  const { sentData, setSentData } = useStore();

  const feeSettings = networkApi?.feeSettings;
  const gasSettings = networkApi?.gasSettings;

  const [returnURL, setReturnURL] = useState<string | undefined>();
  const [decodedTxBody, setDecodedTxBody] = useState<TxBody | undefined>();

  const decodedMessage = useMemo<{
    sponsor: string;
    returnUrl: string;
    body: TxBody;
  }>(() => {
    try {
      return message ? stringToObject(message) : null;
    } catch (error) {
      return null;
    }
  }, [message]);

  const fromAddress = useMemo(() => {
    try {
      return AddressApi.encodeAddress(Uint8Array.from(decodedMessage.body.f))
        ?.txt;
    } catch (error) {
      return;
    }
  }, [decodedMessage?.body?.f]);

  const isWalletExists = useMemo<boolean>(() => {
    return wallets.some((wallet) => wallet.address === fromAddress);
  }, [fromAddress, wallets]);

  const isCurrentActiveWallet = useMemo<boolean>(() => {
    return activeWallet?.address === fromAddress;
  }, [activeWallet?.address, fromAddress]);

  useEffect(() => {
    if (isWalletExists && !isCurrentActiveWallet) {
      fromAddress && setActiveWalletByAddress(fromAddress);
    } else if (!isWalletExists) {
      toast.error('Wallet not found');
    }
  }, [
    fromAddress,
    isCurrentActiveWallet,
    isWalletExists,
    setActiveWalletByAddress
  ]);

  useEffect(() => {
    try {
      if (!decodedMessage) {
        throw new Error('Message not found');
      }
      if (!activeWallet) {
        throw new Error('Wallet not found');
      }

      let txBody = decodedMessage?.body;
      setReturnURL(decodedMessage?.returnUrl);
      const sponsor = decodedMessage?.sponsor;

      const srcFee = txBody?.p?.find(
        (purpose) => purpose?.[0] === TxPurpose.SRCFEE
      );
      const gas = txBody?.p?.find((purpose) => purpose?.[0] === TxPurpose.GAS);

      if (!txBody?.e) {
        txBody.e = {};
      }

      txBody.t = BigInt(Date.now());

      if (sponsor) {
        txBody.e.sponsor = [
          isAddress(sponsor)
            ? Buffer.from(hexToBytes(sponsor))
            : Buffer.from(AddressApi.parseTextAddress(sponsor))
        ];
      }

      if (!gas) {
        txBody = autoAddGas(txBody, gasSettings);
      }

      if (!srcFee) {
        txBody = autoAddFee(txBody, feeSettings);
      }

      if (sponsor) {
        txBody.p.forEach((item) => {
          if (item[0] === TxPurpose.SRCFEE) {
            item[0] = TxPurpose.SPONSOR_SRCFEE;
          }
          if (item[0] === TxPurpose.GAS) {
            item[0] = TxPurpose.SPONSOR_GAS;
          }
        });
      }

      if (isObject(txBody)) {
        setDecodedTxBody(txBody);
      }
    } catch (err) {
      console.error(err);
    }
  }, [message, activeWallet, gasSettings, feeSettings, decodedMessage]);

  useEffect(() => {
    return () => {
      setSentData(null);
    };
  }, []);

  const handleClickSignAndSend = async () => {
    try {
      if (!activeWallet) {
        throw new Error('Wallet not found');
      }
      const decryptedWif = CryptoApi.decryptWif(activeWallet.encryptedWif, '');
      if (decodedTxBody) {
        signAndSendTxMutation({
          wif: decryptedWif,
          decodedTxBody,
          returnURL,
          additionalActionOnSuccess: (txResponse) => {
            window.opener.postMessage?.(
              objectToString({
                type: 'signAndSendMessageResponse',
                data: txResponse
              }),
              returnURL
            );
            window.close();
          },
          additionalActionOnError(error) {
            window.opener.postMessage?.(
              objectToString({
                type: 'signAndSendMessageError',
                data: error
              }),
              returnURL
            );
            window.close();
          }
        });
      }
    } catch (err) {
      const decryptedWif = await confirm();

      if (decodedTxBody && decryptedWif) {
        signAndSendTxMutation({
          wif: decryptedWif,
          decodedTxBody,
          returnURL,
          additionalActionOnSuccess: (txResponse) => {
            window.opener.postMessage?.(
              objectToString({
                type: 'signAndSendMessageResponse',
                data: txResponse
              }),
              returnURL
            );
          },
          additionalActionOnError: (error) => {
            window.opener.postMessage?.(
              objectToString({
                type: 'signAndSendMessageError',
                data: error
              }),
              returnURL
            );
          }
        });
      }
    }
  };

  const handleClickBack = () => {
    window.opener.postMessage?.(
      objectToString({
        type: 'signAndSendMessageError',
        data: 'reject'
      }),
      returnURL
    );
    window.close();
  };

  const renderHeader = () => (
    <div className={styles.headerLayout}>
      <header className={styles.header}>
        <div className={styles.headerCol}>
          <ThePowerLogoIcon className={styles.headerLogoIcon} />
          <div className={styles.headerText}>POWER WALLET</div>
        </div>
      </header>
    </div>
  );

  const renderExtraDataTable = () => {
    if (!decodedTxBody?.e || isEmpty(decodedTxBody?.e)) return null;

    const items = Object.entries(decodedTxBody?.e).map(([key, value]) => {
      if (key === 'sponsor' && value instanceof Uint8Array) {
        return {
          key,
          value: AddressApi.encodeAddress(value)?.txt
        };
      } else {
        return {
          key,
          value:
            typeof value === 'string'
              ? value
              : bytesToString(Uint8Array.from(value[0]))
        };
      }
    });

    return <CardTable items={items} />;
  };

  const renderContent = () => {
    const txKind = decodedTxBody?.k as number;
    const txKindName = txKind && txKindMap[txKind];
    const to =
      decodedTxBody?.to &&
      AddressApi.hexToTextAddress(decodedTxBody?.to.toString('hex'));

    const transfer = decodedTxBody?.p?.find(
      (item) => item?.[0] === TxPurpose.TRANSFER
    );
    const transferAmount =
      transfer?.[2] && networkApi?.decimals[transfer?.[1]]
        ? formatUnits(transfer?.[2], networkApi?.decimals[transfer?.[1]])
        : null;
    const transferCur = transfer?.[1];

    const fee = decodedTxBody?.p?.find(
      (item) => item?.[0] === TxPurpose.SRCFEE
    );
    const feeAmount =
      fee?.[2] && networkApi?.decimals[fee?.[1]]
        ? formatUnits(fee?.[2], networkApi?.decimals[fee?.[1]])
        : null;
    const feeCur = fee?.[1];

    const call = decodedTxBody?.c;
    const functionName = call?.[0];
    const functionArguments = call?.[1] && JSON.stringify(call?.[1], null, 10);

    const comment = decodedTxBody?.e?.msg;

    const isExtDataEmpty = isEmpty(decodedTxBody?.e);

    return (
      <div className={styles.content}>
        <div className={styles.title}>{t('confirmYourAction')}</div>
        <div className={styles.buttons}>
          <Button onClick={handleClickBack} variant='outlined'>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleClickSignAndSend}
            fullWidth
            variant='contained'
            disabled={!isWalletExists || !isCurrentActiveWallet}
          >
            {t('signAndSend')}
          </Button>
        </div>
        <div className={styles.text}>{t('byClickingSignAndSend')}</div>
        <div className={styles.table}>
          <div className={styles.tableTitle}>{t('transactionType')}</div>
          <div className={styles.tableValue}>{txKindName || '-'}</div>

          <div className={styles.tableTitle}>{t('fee')}</div>
          <div className={styles.tableValue}>
            {(feeAmount && feeCur && `${feeAmount} ${feeCur}`) || '-'}
          </div>

          <div className={styles.tableTitle}>{t('senderAddress')}</div>
          <div className={styles.tableValue}>
            {activeWallet?.address || '-'}
          </div>

          <div className={styles.tableTitle}>{t('addressOfTheRecipient')}</div>
          <div className={styles.tableValue}>{to || '-'}</div>

          <div className={styles.tableTitle}>{t('transactionSubject')}</div>
          <div className={styles.tableValue}>
            {transferAmount && transferCur
              ? `${transferAmount} ${transferCur}`
              : '-'}
          </div>

          <div className={styles.tableTitle}>{t('functionCall')}</div>
          <div className={styles.tableValue}>{functionName || '-'}</div>

          <CardTableKeyAccordion valueLabel={t('callArguments')}>
            {functionArguments || '-'}
          </CardTableKeyAccordion>

          <div className={styles.tableTitle}>{t('comment')}</div>
          <div className={styles.tableValue}>{comment || '-'}</div>

          <div className={styles.tableTitle}>{t('returnURL')}</div>
          <div className={styles.tableValue}>{returnURL || '-'}</div>

          {!isExtDataEmpty && (
            <CardTableKeyAccordion valueLabel={t('extraData')}>
              {renderExtraDataTable()}
            </CardTableKeyAccordion>
          )}
        </div>
      </div>
    );
  };

  if (isPending) {
    return <FullScreenLoader />;
  }

  if (!decodedTxBody) {
    return renderHeader();
  }

  return (
    <div className={cn(styles.signAndSendPage)}>
      {renderHeader()}
      {!sentData ? renderContent() : <TxResult sentData={sentData} />}
    </div>
  );
};

export const SignAndSendPage = SignAndSendPageComponent;
