import React, { useState, useRef } from 'react';
import { Drawer, IconButton } from '@mui/material';
import { useStore } from '@tanstack/react-store';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  useExportAccount,
  useImportWalletFromFile,
  useResetWallet
} from 'account/hooks';
import {
  setIsAccountMenuOpened,
  setIsShowUnderConstruction,
  store
} from 'application/store';
import { useWallets } from 'application/utils/localStorageUtils';
import {
  SupportIcon,
  CreateIcon,
  ExportIcon,
  ImportIcon,
  ResetIcon,
  CloseIcon
} from 'assets/icons';
import { CopyButton } from 'common';
// import { WalletRoutesEnum } from 'application/typings/routes';
import styles from './Account.module.scss';
import { AccountActionsList } from './AccountActionsList';
import { ResetAccountModal } from './ResetAccountModal';
import { ExportAccountModal } from '../../registration/components/modals/ExportAccountModal';
import { ImportAccountModal } from '../../registration/components/modals/ImportAccountModal';
import { Maybe } from '../../typings/common';

type AccountProps = { className?: string };

const Account: React.FC<AccountProps> = ({
  // walletAddress,
  // openedMenu,
  // setShowUnderConstruction,
  // importAccountFromFile,
  // toggleOpenedAccountMenu,
  // resetAccount,
  // exportAccount,
  className
}) => {
  const [accountFile, setAccountFile] = useState<Maybe<File>>(null);
  const [openedImportAccountModal, setOpenedImportAccountModal] =
    useState<boolean>(false);
  const [openedExportAccountModal, setOpenedExportAccountModal] =
    useState<boolean>(false);
  const [openedResetAccountModal, setOpenedResetAccountModal] =
    useState<boolean>(false);
  const importAccountInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const { exportAccountMutation } = useExportAccount(undefined);
  const { importWalletFromFileMutation } = useImportWalletFromFile();
  const { resetWallet } = useResetWallet();
  const { isAccountMenuOpened } = useStore(store);
  const { activeWallet } = useWallets();
  // const handleReferralProgram = () => {
  //   routeTo(WalletRoutesEnum.referralProgram);
  //   toggleOpenedAccountMenu();
  // };

  const handleCreateAccount = () => {
    setIsShowUnderConstruction(true);
  };

  const handleExportAccount = () => {
    exportAccountMutation({
      password: ''
      // additionalActionOnDecryptError: () => {
      //   setOpenedExportAccountModal(true);
      // }
    });
  };

  const closeImportAccountModal = () => {
    setOpenedImportAccountModal(false);
  };

  const handleOpenImportFile = () => {
    if (importAccountInputRef.current) {
      importAccountInputRef.current.click();
    }
  };

  const handleImportAccount = (password: string) => {
    importWalletFromFileMutation({
      password,
      accountFile: accountFile!
    });

    setOpenedImportAccountModal(false);
  };

  const setAccountFileOnChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const accountFile = event?.target?.files?.[0];

    if (!accountFile) {
      return;
    }

    importWalletFromFileMutation({
      password: '',
      accountFile,
      additionalActionOnDecryptError: () => {
        setAccountFile(accountFile);
        setOpenedImportAccountModal(true);
      }
    });

    setIsAccountMenuOpened(!isAccountMenuOpened);
  };

  const closeExportAccountModal = () => {
    setOpenedExportAccountModal(false);
  };

  const handleResetAccount = () => {
    resetWallet(
      ''
      //   {
      //   password: '',
      //   additionalActionOnDecryptError: () => setOpenedResetAccountModal(true)
      // }
    );
  };

  const closeResetAccountModal = () => {
    setOpenedResetAccountModal(false);
  };

  const getAccountActionsData = () => [
    // {
    //   title: t('referralProgram'),
    //   action: handleReferralProgram,
    //   Icon: CreateIcon,
    // },
    {
      title: t('createNewAccount'),
      action: handleCreateAccount,
      Icon: CreateIcon
    },
    {
      title: t('exportAccount'),
      action: handleExportAccount,
      Icon: ExportIcon
    },
    {
      title: t('importAccount'),
      action: handleOpenImportFile,
      Icon: ImportIcon
    },
    {
      title: t('resetAccount'),
      action: handleResetAccount,
      Icon: ResetIcon
    }
  ];

  const toggleAccountMenu = () => {
    setIsAccountMenuOpened(!isAccountMenuOpened);
  };

  return (
    <div className={cn(styles.account, className)}>
      <input
        ref={importAccountInputRef}
        className={styles.importAccountInput}
        onChange={setAccountFileOnChange}
        type='file'
      />
      <Drawer
        anchor={'left'}
        open={isAccountMenuOpened}
        onClose={toggleAccountMenu}
        elevation={0}
        classes={{
          paper: styles.drawerPaper,
          root: styles.drawerModalRoot
        }}
        ModalProps={{
          componentsProps: {
            backdrop: {
              className: styles.drawerBackdrop
            }
          }
        }}
      >
        <IconButton className={styles.closeButton} onClick={toggleAccountMenu}>
          <CloseIcon />
        </IconButton>
        <div className={styles.accountTitle}>{t('myAccount')}</div>
        <CopyButton
          textButton={activeWallet?.address || ''}
          className={styles.addressButton}
          iconClassName={styles.copyIcon}
        />
        <AccountActionsList actions={getAccountActionsData()} />
        <a
          className={styles.supportLink}
          rel={'noreferrer'}
          target={'_blank'}
          href={'https://t.me/thepower_chat'}
        >
          <SupportIcon />
        </a>
      </Drawer>
      <ImportAccountModal
        open={openedImportAccountModal}
        onClose={closeImportAccountModal}
        onSubmit={handleImportAccount}
      />
      <ExportAccountModal
        open={openedExportAccountModal}
        onClose={closeExportAccountModal}
      />
      <ResetAccountModal
        open={openedResetAccountModal}
        onClose={closeResetAccountModal}
      />
    </div>
  );
};

export default Account;
