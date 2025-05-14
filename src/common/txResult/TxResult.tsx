import React from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import appEnvs from 'appEnvs';
import { SentData } from 'application/store';
import { sliceString } from 'application/utils/applicationUtils';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { Button } from 'common';
import { SuccessSvg } from './icons';
import styles from './TxResult.module.scss';

type TxResultProps = {
  sentData: SentData;
  className?: string;
};

const TxResult: React.FC<TxResultProps> = ({ sentData, className }) => {
  const { t } = useTranslation();
  const { activeWallet } = useWalletsStore();

  const txExplorerLink = `${appEnvs.EXPLORER_THEPOWER_URL}/${activeWallet?.chainId}/transaction/${sentData.txId}`;

  const onClickClose = () => {
    if (sentData.returnURL) {
      window.close();
    }
  };

  const onCopyClick = () => {
    navigator.clipboard.writeText(txExplorerLink);
    toast.info(t('linkTransactionCopied'));
  };

  return (
    <div className={styles.txResult}>
      <div className={cn(styles.result, className)}>
        <div>
          <div className={styles.resultKey}>{t('amount')}</div>
          <div className={styles.resultValue}>
            {sentData?.amount}
            {/* <LogoIcon height={24} width={24} className={styles.icon} /> */}
          </div>
        </div>
        <div>
          <div className={styles.resultKey}>{t('from')}</div>
          <div className={styles.resultValue}>
            {sentData?.from?.length && sentData?.from.length > 20
              ? sliceString(sentData?.from, 10)
              : sentData?.from}
          </div>
        </div>
        <div>
          <div className={styles.resultKey}>{t('to')}</div>
          <div className={styles.resultValue}>
            {sentData?.to?.length && sentData?.to.length > 20
              ? sliceString(sentData?.to, 10)
              : sentData?.to}
          </div>
        </div>
        <div>
          <div className={styles.resultKey}>{t('tx')}</div>
          <div className={styles.resultValue_success}>
            {sentData?.txId}
            <SuccessSvg className={styles.resultValue__successIcon} />
          </div>
        </div>
        <div>
          <div className={styles.commentLabel}>{t('comments')}</div>
          <div className={styles.comment}>{sentData?.comment}</div>
        </div>
      </div>
      {/* <div className={styles.columns}> */}
      {/* <div className={styles.socials}>
        {socialLinks.map(({ Icon, url }) => <Icon className={styles.socialsIcon} />)}
      </div> */}
      <div className={styles.buttons}>
        <Button onClick={onCopyClick} variant='outlined' fullWidth>
          {t('share')}
        </Button>
        <a
          target='_blank'
          href={txExplorerLink}
          style={{ width: '100%' }}
          rel='noreferrer'
        >
          <Button variant='contained' fullWidth>
            {t('explorer')}
          </Button>
        </a>
      </div>
      {sentData.returnURL && (
        <Button onClick={onClickClose} variant='contained' fullWidth>
          {t('close')}
        </Button>
      )}
      {/* </div> */}
    </div>
  );
};

export default TxResult;
