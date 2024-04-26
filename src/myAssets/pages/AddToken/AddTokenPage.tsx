import { push } from 'connected-react-router';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { OutlinedInput } from '@mui/material';
import { RootState } from 'application/store';
import { Button, PageTemplate, Tabs } from 'common';
import { Token } from 'myAssets/components/Token';
import { getTokens } from 'myAssets/selectors/tokensSelectors';
import { getWalletNativeTokensAmounts } from 'myAssets/selectors/walletSelectors';
import {
  addTokenTrigger,
  toggleTokenShow,
  TokenType,
} from 'myAssets/slices/tokensSlice';
import { AddTokensTabs, getAddTokenTabsLabels } from 'myAssets/types';
import { WithTranslation, withTranslation } from 'react-i18next';
import SearchInput from '../../../common/searchInput/SearchInput';
import styles from './AddTokenPage.module.scss';

const mapDispatchToProps = {
  routeTo: push,
  addTokenTrigger,
  toggleTokenShow,
};

const mapStateToProps = (state: RootState) => ({
  amounts: getWalletNativeTokensAmounts(state),
  tokens: getTokens(state),
});

interface AddTokenPageState {
  search: string;
  address: string;
  tab: AddTokensTabs;
}

const connector = connect(mapStateToProps, mapDispatchToProps);
type AddTokenPageProps = ConnectedProps<typeof connector> & WithTranslation;

class AddTokenPageComponent extends React.PureComponent<
AddTokenPageProps,
AddTokenPageState
> {
  constructor(props: AddTokenPageProps) {
    super(props);

    this.state = {
      address: '',
      search: '',
      tab: AddTokensTabs.Erc20,
    };
  }

  onChangeTab = (_event: React.SyntheticEvent, value: AddTokensTabs) => {
    this.setState({ tab: value });
  };

  onChangeAddressInput = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    this.setState({ address: e.target.value });
  };

  onChangeSearchInput = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    this.setState({ search: e.target.value });
  };

  renderAssetsList = (assets: TokenType[]) => {
    const { toggleTokenShow } = this.props;

    if (!assets.length && this.state.search) {
      return (
        <div className={styles.noTokens}>{this.props.t('assetNotFound')}</div>
      );
    }
    if (!assets.length) {
      return (
        <div className={styles.noTokens}>
          {this.props.t('yourTokensWillBeHere')}
        </div>
      );
    }
    return (
      <ul className={styles.tokensList}>
        {assets.map((token) => (
          <li key={token.address}>
            <Token
              token={token}
              onClickSwitch={() => toggleTokenShow({
                address: token.address,
                isShow: !token.isShow,
              })}
            />
          </li>
        ))}
      </ul>
    );
  };

  renderAddTokenForm = () => {
    const { onChangeAddressInput, props, state } = this;
    const { addTokenTrigger } = props;
    const { address } = state;
    return (
      <div className={styles.addAssetsPageForm}>
        <div className={styles.addAssetsPageFormTip}>
          {this.props.t('youCanAddAnyStandardToken')}
        </div>

        <OutlinedInput
          placeholder={this.props.t('assetsAddress')!}
          fullWidth
          size="small"
          className={styles.addAssetsPageFormInput}
          value={address}
          onChange={onChangeAddressInput}
        />
        <Button
          className={styles.addAssetsPageFormButton}
          onClick={() => addTokenTrigger(address)}
          variant="filled"
          disabled={!address}
        >
          {this.props.t('addToken')}
        </Button>
      </div>
    );
  };

  render() {
    const { tokens: erc20Tokens } = this.props;
    const { tab, search } = this.state;

    const tokensMap = {
      [AddTokensTabs.Erc20]: erc20Tokens,
      [AddTokensTabs.NFT]: [],
      [AddTokensTabs.AddTokens]: [],
    };

    const currentTokens = tokensMap[tab];

    const filteredAssets = currentTokens?.filter((token) => {
      const regexp = new RegExp(search, 'gmi');
      const stringifiedToken = JSON.stringify(token);
      return !search || regexp.test(stringifiedToken);
    });

    return (
      <PageTemplate
        topBarChild={this.props.t('addToken')}
        backUrl="/"
        backUrlText={this.props.t('home')!}
      >
        <div className={styles.addAssetsPage}>
          <SearchInput
            className={styles.addAssetsPageSearchInput}
            onClickSearch={() => {}}
            onChange={this.onChangeSearchInput}
            value={search}
          />
          <Tabs
            tabs={AddTokensTabs}
            tabsLabels={getAddTokenTabsLabels()}
            value={tab}
            onChange={this.onChangeTab}
            tabsRootClassName={styles.addAssetsPageTabsRoot}
            tabsHolderClassName={styles.addAssetsPageTabsHolder}
            tabClassName={styles.addAssetsPageTab}
            tabIndicatorClassName={styles.addAssetsPageTabIndicator}
            tabSelectedClassName={styles.addAssetsPageTabSelected}
          />
          {tab === AddTokensTabs.AddTokens ? (
            this.renderAddTokenForm()
          ) : (
            <div className={styles.tokens}>
              {this.renderAssetsList(filteredAssets)}
            </div>
          )}
        </div>
      </PageTemplate>
    );
  }
}

export const AddTokenPage = withTranslation()(
  connector(AddTokenPageComponent),
);
