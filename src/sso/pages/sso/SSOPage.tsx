import { FC, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useImportWalletFromFile } from 'account/hooks';
import { AppQueryParams, RoutesEnum } from 'application/typings/routes';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import { BigFingerPrintIcon } from 'assets/icons';
import { Button } from 'common';
import { ImportAccountModal } from 'registration/components/modals/ImportAccountModal';
import { objectToString, stringToObject } from 'sso/utils';
import styles from './SSOPage.module.scss';

export const SSOPage: FC = () => {
  const [view, setView] = useState<'start' | 'login'>('start');
  const [openedImportAccountModal, setOpenedImportAccountModal] =
    useState(false);
  const [accountFile, setAccountFile] = useState<File | null>(null);
  const importAccountInputRef = useRef<HTMLInputElement>(null);

  const { data } = useParams<{ data: string }>();
  const { wallets, setActiveWalletByAddress } = useWalletsStore();
  const { t } = useTranslation();

  const { importWalletFromFileMutation } = useImportWalletFromFile();
  const navigate = useNavigate();
  const parsedData = useMemo<AppQueryParams | null>(() => {
    try {
      return data ? stringToObject(data) : null;
    } catch {
      return null;
    }
  }, [data]);

  const chainID = parsedData?.chainID;

  const walletsWithChain = wallets.filter(
    (wallet) => wallet.chainId === chainID
  );
  const isWalletWithRequiredChainExists = walletsWithChain.length > 0;

  const onClickWalletCardHandler = useCallback(
    (walletAddress: string) => {
      if (parsedData?.callbackUrl) {
        const stringData = objectToString({
          address: walletAddress,
          returnUrl: parsedData.returnUrl
        });
        setActiveWalletByAddress(walletAddress);
        window.opener.postMessage?.(
          objectToString({
            type: 'authenticateResponse',
            data: stringData
          }),
          parsedData.returnUrl
        );
        window.close();
      }
    },
    [parsedData, setActiveWalletByAddress]
  );

  const onClickLoginHandler = useCallback(() => {
    if (!isWalletWithRequiredChainExists) {
      navigate(`${RoutesEnum.login}/${data}`);
    } else {
      setView('login');
    }
  }, [data, isWalletWithRequiredChainExists, navigate]);

  const onClickBackHandler = useCallback(() => {
    setView('start');
  }, []);

  const onImportSuccess = useCallback(
    (
      params:
        | {
            address?: string;
            chainId?: number;
          }
        | undefined
    ) => {
      if (params && params.address) {
        if (params.chainId !== parsedData?.chainID) {
          toast.error(t('wrongChainLogin'));
          setOpenedImportAccountModal(false);
          return;
        }
        setActiveWalletByAddress(params.address);
        setOpenedImportAccountModal(false);
        onClickWalletCardHandler(params.address);
      }
    },
    [onClickWalletCardHandler, parsedData?.chainID, setActiveWalletByAddress, t]
  );

  const setAccountFileOnChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const accountFile = event?.target?.files?.[0];

      if (!accountFile) {
        return;
      }

      importWalletFromFileMutation({
        password: '',
        accountFile,
        additionalActionOnSuccess: onImportSuccess,
        additionalActionOnDecryptError: () => {
          setAccountFile(accountFile);
          setOpenedImportAccountModal(true);
        }
      });
    },
    [importWalletFromFileMutation, onImportSuccess]
  );

  const closeImportAccountModal = () => {
    setOpenedImportAccountModal(false);
  };

  const handleImportAccount = useCallback(
    (password: string) => {
      importWalletFromFileMutation({
        password,
        accountFile: accountFile!,
        isWithoutGoHome: true,
        additionalActionOnSuccess: onImportSuccess
      });
    },
    [accountFile, importWalletFromFileMutation, onImportSuccess]
  );

  const handleWindowResize = useCallback(() => {
    window.moveTo(0, 0);
    window.resizeTo(screen.width, screen.height);
  }, []);

  const truncate = (str: string, maxLength: number) =>
    str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;

  const buttons = useMemo(() => {
    return (
      <div className={styles.buttons}>
        <Button
          onClick={handleWindowResize}
          variant='contained'
          to={`${RoutesEnum.signup}/${data}`}
        >
          {t('createPowerWallet')}
        </Button>
        <Button variant='outlined' onClick={onClickLoginHandler}>
          {t('login')}
        </Button>
      </div>
    );
  }, [data, handleWindowResize, onClickLoginHandler, t]);

  const renderContent = useMemo(() => {
    if (!wallets?.length) {
      return buttons;
    } else if (isWalletWithRequiredChainExists) {
      return (
        <>
          <div className={styles.subtitle}>{t('pleaseSelectAccount')}</div>
          <div className={styles.walletList}>
            {walletsWithChain.map((wallet) => (
              <div
                className={styles.walletCard}
                key={wallet.address}
                onClick={() => onClickWalletCardHandler(wallet.address)}
              >
                <div title={wallet.name} className={styles.name}>
                  {truncate(wallet.name, 20)}
                </div>
                <div className={styles.address}>{wallet.address}</div>
                <div className={styles.chain}>
                  {t('chain')}: {wallet.chainId}
                </div>
              </div>
            ))}
          </div>
          <Button variant='outlined' onClick={onClickBackHandler}>
            {t('back')}
          </Button>
        </>
      );
    } else {
      return (
        <>
          <div className={styles.subtitle}>
            {t('youDontHaveWalletForChain')} {chainID}
          </div>
          {buttons}
        </>
      );
    }
  }, [
    wallets?.length,
    isWalletWithRequiredChainExists,
    buttons,
    t,
    walletsWithChain,
    onClickBackHandler,
    onClickWalletCardHandler,
    chainID
  ]);

  const startView = useMemo(() => {
    return (
      <>
        <ImportAccountModal
          open={openedImportAccountModal}
          onClose={closeImportAccountModal}
          onSubmit={handleImportAccount}
        />
        <BigFingerPrintIcon className={styles.icon} />
        <div className={styles.subtitle}>{t('pleaseConfirmYourAction')}</div>
        <div className={styles.description}>
          <p>{t('thisSecureStepIsNecessary')}</p>
          <p>{t('yourDigitalSignatureIsASafeguard')}</p>
        </div>
        {buttons}
        <input
          ref={importAccountInputRef}
          className={styles.importAccountInput}
          onChange={setAccountFileOnChange}
          type='file'
        />
        <button
          onClick={() => importAccountInputRef.current?.click()}
          className={styles.importButton}
        >
          {t('importAccount')}
        </button>
      </>
    );
  }, [
    buttons,
    handleImportAccount,
    openedImportAccountModal,
    setAccountFileOnChange,
    t
  ]);

  return (
    <div className={styles.walletSSOPage}>
      <div className={styles.title}>{t('walletAuthorization')}</div>
      {view === 'start' ? startView : renderContent}
    </div>
  );
};
