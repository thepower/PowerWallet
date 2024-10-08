import React, { useState, useRef } from 'react';
import { Drawer, IconButton } from '@mui/material';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  useExportAccount,
  useImportWalletFromFile,
  useResetWallet
} from 'account/hooks';
import { useStore } from 'application/store';
import { WalletRoutesEnum } from 'application/typings/routes';
import { useWalletsStore } from 'application/utils/localStorageUtils';
import {
  SupportIcon,
  CreateIcon,
  ExportIcon,
  ImportIcon,
  ResetIcon,
  CloseIcon,
  RenameIcon
} from 'assets/icons';
import { CopyButton } from 'common';
import styles from './Account.module.scss';
import { AccountActionsList } from './AccountActionsList';
import { RenameAccountModal } from './RenameAccountModal';
import { ResetAccountModal } from './ResetAccountModal';
import { ExportAccountModal } from '../../registration/components/modals/ExportAccountModal';
import { ImportAccountModal } from '../../registration/components/modals/ImportAccountModal';
import { Maybe } from '../../typings/common';

type AccountProps = { className?: string };

const Account: React.FC<AccountProps> = ({ className }) => {
  const [accountFile, setAccountFile] = useState<Maybe<File>>(null);
  const [openedImportAccountModal, setOpenedImportAccountModal] =
    useState(false);
  const [openedExportAccountModal, setOpenedExportAccountModal] =
    useState(false);
  const [openedResetAccountModal, setOpenedResetAccountModal] = useState(false);
  const [openedRenameAccountModal, setOpenedRenameAccountModal] =
    useState(false);

  const importAccountInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { exportAccountMutation } = useExportAccount();
  const { importWalletFromFileMutation } = useImportWalletFromFile();
  const { resetWallet } = useResetWallet();
  const { isAccountMenuOpened, setIsAccountMenuOpened } = useStore();
  const { activeWallet } = useWalletsStore();

  const handleCreateAccount = () => {
    navigate(WalletRoutesEnum.signup);
  };

  const handleExportAccount = () => {
    exportAccountMutation({
      password: '',
      additionalActionOnDecryptError: () => {
        setOpenedExportAccountModal(true);
      }
    });
  };

  const handleRenameAccount = () => {
    setOpenedRenameAccountModal(true);
  };

  const closeImportAccountModal = () => {
    setOpenedImportAccountModal(false);
    setIsAccountMenuOpened(false);
  };

  const handleOpenImportFile = () => {
    navigate(WalletRoutesEnum.login);
    setIsAccountMenuOpened(false);
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
  };

  const closeExportAccountModal = () => {
    setOpenedExportAccountModal(false);
    setIsAccountMenuOpened(false);
  };

  const handleResetAccount = () => {
    resetWallet({
      password: '',
      additionalActionOnSuccess: () => {
        setIsAccountMenuOpened(false);
      },
      additionalActionOnDecryptError: () => setOpenedResetAccountModal(true)
    });
  };

  const closeResetAccountModal = () => {
    setOpenedResetAccountModal(false);
    setIsAccountMenuOpened(false);
  };

  const closeRenameAccountModal = () => {
    setOpenedRenameAccountModal(false);
    setIsAccountMenuOpened(false);
  };

  const getAccountActionsData = () => [
    {
      title: t('createNewAccount'),
      action: handleCreateAccount,
      Icon: CreateIcon
    },
    {
      title: t('renameAccount'),
      action: handleRenameAccount,
      Icon: RenameIcon
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
      <RenameAccountModal
        open={openedRenameAccountModal}
        onClose={closeRenameAccountModal}
      />
    </div>
  );
};

export default Account;
