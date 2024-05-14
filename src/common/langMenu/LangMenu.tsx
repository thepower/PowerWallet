import React, { FC, useCallback } from 'react';
import {
  MenuProps as MuiMenuProps,
  MenuItem,
  MenuItemClasses,
  Menu,
  MenuClasses,
} from '@mui/material';

import { useTranslation } from 'react-i18next';
import { buildYupLocale, langsKeys } from 'locales/initTranslation';
import { LangIcon } from 'assets/icons';
import { IconButton } from 'common';
import styles from './LangMenu.module.scss';

type SelectProps = Omit<MuiMenuProps, 'open'>;

const menuClasses: Partial<MenuClasses> = { list: styles.menuList, paper: styles.menuPaper, root: styles.menuRoot };

const menuItemClasses: Partial<MenuItemClasses> = {
  selected: styles.menuItemSelected,
  root: styles.menuItemRoot,
};

export const LangMenu: FC<SelectProps> = ({
  className,
}) => {
  const { t, i18n } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = useCallback(
    (newLng: string): void => {
      if (i18n.isInitialized && i18n.language !== newLng) {
        i18n.changeLanguage(newLng);

        buildYupLocale(null, t);
      }
    },
    [t, i18n],
  );

  return (
    <div>
      <IconButton
        onClick={handleClick}
        className={className}
      >
        <LangIcon />
      </IconButton>
      <Menu
        id="lang-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        classes={menuClasses}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {langsKeys.map((rowsPerPageOption) => (
          <MenuItem
            disableRipple
            key={rowsPerPageOption}
            value={rowsPerPageOption}
            classes={menuItemClasses}
            onClick={() => {
              changeLanguage(rowsPerPageOption);
              handleClose();
            }}
          >
            {rowsPerPageOption}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};
