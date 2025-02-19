import React, { useCallback } from 'react';
import cn from 'classnames';

import { useStore } from 'application/store';
import { BellIcon, MenuIcon } from 'assets/icons';
import i18n from 'locales/initTranslation';
import styles from './TopBar.module.scss';
import ArrowLink from '../arrowLink/ArrowLink';
import IconButton from '../iconButton/IconButton';
import { LangMenu } from '../langMenu/LangMenu';

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
  className
}) => {
  const {
    isAccountMenuOpened,
    setIsShowUnderConstruction,
    setIsAccountMenuOpened
  } = useStore();
  const handleShowUnderConstruction = useCallback(() => {
    setIsShowUnderConstruction(true);
  }, []);

  const toggleAccountMenu = useCallback(() => {
    setIsAccountMenuOpened(!isAccountMenuOpened);
  }, [isAccountMenuOpened]);

  const renderLeft = useCallback(() => {
    if (backUrl) {
      return (
        <ArrowLink
          to={backUrl}
          direction='left'
          hideTextOnMobile
          size='small'
          defaultColor='lilac'
        >
          {backUrlText}
        </ArrowLink>
      );
    }
    return (
      <IconButton onClick={toggleAccountMenu}>
        <MenuIcon />
      </IconButton>
    );
  }, [backUrl, backUrlText, toggleAccountMenu]);

  const renderCenter = useCallback(() => {
    if (children) {
      return <div className={styles.centerText}>{children}</div>;
    }

    return <div className={styles.title}>Power Wallet</div>;
  }, [children]);

  return (
    <header className={cn(styles.bar, className)}>
      {renderLeft()}
      {renderCenter()}
      <div className={cn(styles.controlsSet)}>
        <LangMenu />
        {/* <IconButton onClick={handleShowUnderConstruction}>
          <BellIcon />
        </IconButton> */}
      </div>
    </header>
  );
};

export default TopBar;
