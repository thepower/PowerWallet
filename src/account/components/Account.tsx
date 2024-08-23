import React, { useState, useRef } from 'react';
import { Drawer, IconButton } from '@mui/material';
import cn from 'classnames';
import { push } from 'connected-react-router';
import { WithTranslation, withTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';
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
import { setShowUnderConstruction } from '../../application/slice/applicationSlice';
import { RootState } from '../../application/store';
import { ExportAccountModal } from '../../registration/components/modals/ExportAccountModal';
import { ImportAccountModal } from '../../registration/components/modals/ImportAccountModal';
import { Maybe } from '../../typings/common';
import { getOpenedMenu, getWalletAddress } from '../selectors/accountSelectors';
import {
  exportAccount,
  importAccountFromFile,
  resetAccount,
  toggleOpenedAccountMenu
} from '../slice/accountSlice';

const mapStateToProps = (state: RootState) => ({
  walletAddress: getWalletAddress(state),
  openedMenu: getOpenedMenu(state)
});

const mapDispatchToProps = {
  importAccountFromFile,
  setShowUnderConstruction,
  toggleOpenedAccountMenu,
  resetAccount,
  exportAccount,
  routeTo: push
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type AccountProps = ConnectedProps<typeof connector> &
  WithTranslation & { className?: string };

const Account: React.FC<AccountProps> = ({
  walletAddress,
  openedMenu,
  setShowUnderConstruction,
  importAccountFromFile,
  toggleOpenedAccountMenu,
  resetAccount,
  exportAccount,
  t,
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

  // const handleReferralProgram = () => {
  //   routeTo(WalletRoutesEnum.referralProgram);
  //   toggleOpenedAccountMenu();
  // };

  const handleCreateAccount = () => {
    setShowUnderConstruction(true);
  };

  const handleExportAccount = () => {
    exportAccount({
      password: '',
      additionalActionOnDecryptError: () => {
        setOpenedExportAccountModal(true);
      }
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
    importAccountFromFile({
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

    importAccountFromFile({
      password: '',
      accountFile,
      additionalActionOnDecryptError: () => {
        setAccountFile(accountFile);
        setOpenedImportAccountModal(true);
      }
    });

    toggleOpenedAccountMenu();
  };

  const closeExportAccountModal = () => {
    setOpenedExportAccountModal(false);
  };

  const handleResetAccount = () => {
    resetAccount({
      password: '',
      additionalActionOnDecryptError: () => setOpenedResetAccountModal(true)
    });
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
    toggleOpenedAccountMenu();
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
        open={openedMenu}
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
          textButton={walletAddress}
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

export default withTranslation()(connector(Account));
