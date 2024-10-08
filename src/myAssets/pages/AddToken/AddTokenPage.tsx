import React, { FC, useCallback, useState } from 'react';
import { OutlinedInput } from '@mui/material';
import { push } from 'connected-react-router';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import { getNetworkChainID } from 'application/selectors';
import { RootState } from 'application/store';
import { Button, PageTemplate, Tabs } from 'common';
import { Token } from 'myAssets/components/Token';
import { getTokens } from 'myAssets/selectors/tokensSelectors';
import { addTokenTrigger, toggleTokenShow } from 'myAssets/slices/tokensSlice';
import {
  AddTokensTabs,
  TokenKind,
  getAddTokenTabsLabels
} from 'myAssets/types';
import styles from './AddTokenPage.module.scss';
import SearchInput from '../../../common/searchInput/SearchInput';

const mapDispatchToProps = {
  routeTo: push,
  addTokenTrigger,
  toggleTokenShow
};

const mapStateToProps = (state: RootState) => ({
  tokens: getTokens(state),
  chainId: getNetworkChainID(state)
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type AddTokenPageProps = ConnectedProps<typeof connector>;

const AddTokenPageComponent: FC<AddTokenPageProps> = ({
  tokens,
  addTokenTrigger,
  toggleTokenShow,
  chainId
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [tab, setTab] = useState<AddTokensTabs>(AddTokensTabs.Erc20);

  const onChangeTab = (_event: React.SyntheticEvent, value: AddTokensTabs) => {
    setTab(value);
  };

  const onChangeAddressInput = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setAddress(e.target.value);
  };

  const onChangeSearchInput = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setSearch(e.target.value);
  };

  const onClickAddToken = useCallback(() => {
    addTokenTrigger({ address });
  }, [addTokenTrigger, address]);

  const renderAddTokenForm = useCallback(
    () => (
      <div className={styles.addAssetsPageForm}>
        <div className={styles.addAssetsPageFormTip}>
          {t('youCanAddAnyStandardToken')}
        </div>

        <OutlinedInput
          placeholder={t('assetsAddress')!}
          fullWidth
          size='small'
          className={styles.addAssetsPageFormInput}
          value={address}
          onChange={onChangeAddressInput}
        />
        <Button
          className={styles.addAssetsPageFormButton}
          onClick={onClickAddToken}
          variant='contained'
          disabled={!address}
        >
          {t('addToken')}
        </Button>
      </div>
    ),
    [address, onClickAddToken, t]
  );

  const erc20tokens = tokens.filter(
    (token) => token.type === TokenKind.Erc20 && token?.chainId === chainId
  );
  const erc721tokens = tokens.filter(
    (token) => token.type === TokenKind.Erc721 && token?.chainId === chainId
  );

  const tokensMap = {
    [AddTokensTabs.Erc20]: erc20tokens,
    [AddTokensTabs.Erc721]: erc721tokens,
    [AddTokensTabs.AddTokens]: []
  };

  const currentTokens = tokensMap[tab];

  const filteredTokens = currentTokens?.filter((token) => {
    const regexp = new RegExp(search, 'gmi');
    const stringifiedToken = JSON.stringify(token);
    return !search || regexp.test(stringifiedToken);
  });

  const renderAssetsList = useCallback(() => {
    if (!filteredTokens.length && search) {
      return <div className={styles.noTokens}>{t('tokenNotFound')}</div>;
    }
    if (!filteredTokens.length) {
      return <div className={styles.noTokens}>{t('yourTokensWillBeHere')}</div>;
    }
    return (
      <ul className={styles.tokensList}>
        {filteredTokens.map((token) => (
          <li key={token.address}>
            <Token
              token={token}
              onClickSwitch={() =>
                toggleTokenShow({
                  address: token.address,
                  isShow: !token.isShow
                })
              }
            />
          </li>
        ))}
      </ul>
    );
  }, [filteredTokens, search, t]);

  return (
    <PageTemplate
      topBarChild={t('addToken')}
      backUrl='/'
      backUrlText={t('home')!}
    >
      <div className={styles.addAssetsPage}>
        <SearchInput
          className={styles.addAssetsPageSearchInput}
          onClickSearch={() => {}}
          onChange={onChangeSearchInput}
          value={search}
        />
        <Tabs
          tabs={AddTokensTabs}
          tabsLabels={getAddTokenTabsLabels()}
          value={tab}
          onChange={onChangeTab}
          tabsRootClassName={styles.addAssetsPageTabsRoot}
        />
        {tab === AddTokensTabs.AddTokens ? (
          renderAddTokenForm()
        ) : (
          <div className={styles.tokens}>{renderAssetsList()}</div>
        )}
      </div>
    </PageTemplate>
  );
};

export const AddTokenPage = connector(AddTokenPageComponent);
