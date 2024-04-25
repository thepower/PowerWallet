import cn from 'classnames';
import React, { useCallback } from 'react';
import i18n from 'locales/initTranslation';
import { BellIcon, MenuIcon } from 'assets/icons';
import { setShowUnderConstruction } from 'application/slice/applicationSlice';
import { useAppDispatch } from 'application/store';
import { toggleOpenedAccountMenu } from 'account/slice/accountSlice';
import ArrowLink from '../arrowLink/ArrowLink';
import IconButton from '../iconButton/IconButton';
import { LangMenu } from '../langMenu/LangMenu';
import styles from './TopBar.module.scss';

type TopBarProps = {
  backUrl?: string;
  backUrlText?: string;
  children?: React.ReactNode;
  className?: string;
};

const TopBar: React.FC<TopBarProps> = ({
  children,
  backUrl,
  backUrlText = i18n.t('back')!,
  className,
}) => {
  const dispatch = useAppDispatch();
  const handleShowUnderConstruction = useCallback(() => {
    dispatch(setShowUnderConstruction(true));
  }, [dispatch]);

  const toggleAccountMenu = useCallback(() => {
    dispatch(toggleOpenedAccountMenu());
  }, [dispatch]);

  const renderLeft = useCallback(() => {
    if (backUrl) {
      return <ArrowLink
        to={backUrl}
        direction="left"
        hideTextOnMobile
        size="small"
        defaultColor="lilac"
      >
        {backUrlText}
      </ArrowLink>;
    }
    return (
      <IconButton
        onClick={toggleAccountMenu}
      >
        <MenuIcon />
      </IconButton>
    );
  }, [backUrl, backUrlText, toggleAccountMenu]);

  const renderCenter = useCallback(() => {
    if (children) {
      return (
        <div>
          {children}
        </div>
      );
    }

    return <div className={styles.title}>Power Wallet</div>;
  }, [children]);

  return (
    <header className={cn(styles.bar, className)}>
      {renderLeft()}
      {renderCenter()}
      <div className={cn(styles.controlsSet)}>
        <LangMenu />
        <IconButton
          onClick={handleShowUnderConstruction}
        >
          <BellIcon />
        </IconButton>
      </div>
    </header>
  );
};

export default TopBar;
