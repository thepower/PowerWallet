import React from 'react';
import {
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem,
  InputBase,
  SelectClasses,
  InputBaseClasses,
  MenuClasses,
  MenuItemClasses,
} from '@mui/material';

import cn from 'classnames';
import { ChevronDownIcon } from 'assets/icons/ChevronDown';
import styles from './ChainSelect.module.scss';

interface ChainSelectProps extends MuiSelectProps {
  items: { title: string; value: number }[];
}

class ChainSelect extends React.PureComponent<ChainSelectProps> {
  private selectClasses: Partial<SelectClasses> = { select: styles.select, icon: styles.icon };

  private inputBaseClasses: Partial<InputBaseClasses> = {
    root: styles.inputBaseRoot,
    input: styles.inputBaseInput,
    focused: styles.inputBaseFocused,
  };

  private menuClasses: Partial<MenuClasses> = { root: styles.menuRoot, list: styles.menuList, paper: styles.menuPaper };

  private menuItemClasses: Partial<MenuItemClasses> = { selected: styles.menuItemSelected, root: styles.menuItemRoot };

  constructor(props: ChainSelectProps) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      className, value, items, onChange, ...otherProps
    } = this.props;
    const {
      selectClasses, inputBaseClasses, menuClasses, menuItemClasses,
    } = this;
    return (
      <MuiSelect
        className={cn(className, !!value && styles.selected)}
        input={<InputBase
          classes={inputBaseClasses}
        />}
        classes={selectClasses}
        IconComponent={ChevronDownIcon}
        MenuProps={{
          classes: menuClasses,
          disableScrollLock: true,
          marginThreshold: 10,
          anchorOrigin: {
            vertical: 48,
            horizontal: 'center',
          },
        }}
        value={value}
        onChange={onChange}
        {...otherProps}
      >
        {items.map((item) => (
          <MenuItem key={item.value} value={item.value} classes={menuItemClasses}>
            {item.title}
          </MenuItem>
        ))}
      </MuiSelect>
    );
  }
}

export default ChainSelect;
