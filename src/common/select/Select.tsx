import React from 'react';
import {
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem,
  InputBase,
  SelectClasses,
  InputBaseClasses,
  MenuClasses,
  MenuItemClasses
} from '@mui/material';

import cn from 'classnames';
import { ChevronDownIcon } from 'assets/icons/ChevronDown';
import styles from './Select.module.scss';

type SelectProps = MuiSelectProps & {
  items: { title: string; value: any }[];
};

class Select extends React.PureComponent<SelectProps> {
  private selectClasses: Partial<SelectClasses> = {
    select: styles.select,
    icon: styles.icon
  };

  private inputBaseClasses: Partial<InputBaseClasses> = {
    root: styles.inputBaseRoot,
    input: styles.inputBaseInput,
    focused: styles.inputBaseFocused,
    sizeSmall: styles.inputBaseSizeSmall,
    colorSecondary: styles.inputBaseColorSecondary
  };

  private menuClasses: Partial<MenuClasses> = {
    root: styles.menuRoot,
    list: styles.menuList,
    paper: styles.menuPaper
  };

  private menuItemClasses: Partial<MenuItemClasses> = {
    selected: styles.menuItemSelected,
    root: styles.menuItemRoot
  };

  render() {
    const { className, value, items, onChange, color, ...otherProps } =
      this.props;
    const { selectClasses, inputBaseClasses, menuClasses, menuItemClasses } =
      this;
    return (
      <MuiSelect
        className={cn(className, !!value && styles.selected)}
        input={<InputBase classes={inputBaseClasses} color={color} />}
        classes={selectClasses}
        IconComponent={ChevronDownIcon}
        MenuProps={{
          classes: menuClasses,
          disableScrollLock: true,
          marginThreshold: 10,
          anchorOrigin: {
            vertical: 48,
            horizontal: 'center'
          }
        }}
        value={value}
        onChange={onChange}
        {...otherProps}
      >
        {items.map((item) => (
          <MenuItem
            key={item.value}
            value={item.value}
            classes={menuItemClasses}
          >
            {item.title}
          </MenuItem>
        ))}
      </MuiSelect>
    );
  }
}

export default Select;
