import React from 'react';
import {
  Tab,
  Box,
  Tabs as MUITabs,
  TabsProps as MUITabsProps
} from '@mui/material';
import classnames from 'classnames';
import styles from './Tabs.module.scss';

interface TabsProps extends MUITabsProps {
  tabs: any;
  tabsLabels: any;
  tabsRootClassName?: string;
  tabsHolderClassName?: string;
  tabClassName?: string;
  tabIndicatorClassName?: string;
  tabSelectedClassName?: string;
  disabledTabs?: string[];
}

class TabsComponent extends React.PureComponent<TabsProps> {
  boxSx = { borderBottom: 1, borderColor: 'divider' };

  getTabClasses = () => {
    const { tabSelectedClassName } = this.props;

    return {
      selected: classnames(styles.selectedTab, tabSelectedClassName)
    };
  };

  getTabsClasses = () => {
    const { tabsRootClassName, tabIndicatorClassName } = this.props;
    return {
      root: classnames(styles.tabsRoot, tabsRootClassName),
      flexContainer: styles.tabsFlexContainer,
      indicator: classnames(styles.tabsIndicator, tabIndicatorClassName)
    };
  };

  renderTab = (key: string) => {
    const { tabs, tabsLabels, tabClassName, disabledTabs } = this.props;
    const labels = tabsLabels || tabs;

    return (
      <Tab
        key={key}
        className={classnames(styles.tab, tabClassName)}
        classes={this.getTabClasses()}
        label={labels[key]}
        value={key}
        disableFocusRipple
        disableRipple
        wrapped
        disabled={disabledTabs?.includes(key)}
      />
    );
  };

  render() {
    const { value, onChange, tabs, tabsHolderClassName } = this.props;

    return (
      <Box
        className={classnames(styles.tabsHolder, tabsHolderClassName)}
        sx={this.boxSx}
      >
        <MUITabs
          value={value}
          onChange={onChange}
          classes={this.getTabsClasses()}
          centered
        >
          {Object.keys(tabs).map(this.renderTab)}
        </MUITabs>
      </Box>
    );
  }
}

export const Tabs = TabsComponent;
