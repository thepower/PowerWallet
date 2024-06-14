import React, {
  useCallback, useEffect, useMemo,
} from 'react';
import { useTranslation } from 'react-i18next';
import { RegistrationCard } from 'registration/components/common/registrationCard/RegistrationCard';
import { RootState } from 'application/store';
import {
  getIsRandomChain,
  getSelectedNetwork,
} from 'registration/selectors/registrationSelectors';
import { ConnectedProps, connect } from 'react-redux';
import { NetworkEnum } from '@thepowereco/tssdk';
import {
  setSelectedChain,
  setSelectedNetwork,
} from 'registration/slice/registrationSlice';
import ChainSelect from 'common/chainSelect/ChainSelect';
import { getNetworksChains } from 'application/selectors';
import { Maybe } from 'typings/common';
import { Button, IconButton, WizardComponentProps } from 'common';
import hooks from 'hooks';
import { useMediaQuery } from '@mui/material';
import { ChevronLeftIcon, ChevronRightIcon } from 'assets/icons';
import registrationStyles from '../../pages/registration/RegistrationPage.module.scss';
import styles from './SelectNetwork.module.scss';

const mapStateToProps = (state: RootState) => ({
  selectedNetwork: getSelectedNetwork(state),
  isRandomChain: getIsRandomChain(state),
  networksChains: getNetworksChains(state),
});

const mapDispatchToProps = {
  setSelectedNetwork,
  setSelectedChain,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type SelectNetworkProps = ConnectedProps<typeof connector> &
WizardComponentProps;

export const SelectNetworkComponent: React.FC<SelectNetworkProps> = ({
  selectedNetwork,
  isRandomChain,
  setSelectedNetwork,
  setSelectedChain,
  networksChains,
  setNextStep,
}) => {
  const { t } = useTranslation();

  const {
    scrollContainerRef,
    scrollToElementByIndex,
    scrollToNext,
    scrollToPrevious,
  } = hooks.useSmoothHorizontalScroll();

  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    if (isMobile) {
      scrollToElementByIndex(1);
    }
  }, []);

  const selectedChains = useMemo(
    () => (selectedNetwork ? networksChains?.[selectedNetwork] || [] : []),
    [networksChains, selectedNetwork],
  );
  const [chain, setChain] = React.useState<Maybe<number>>(null);

  const isRenderSelectChain = useMemo(
    () => selectedNetwork && !isRandomChain,
    [isRandomChain, selectedNetwork],
  );

  const onSelectNetwork = useCallback(
    (network: NetworkEnum) => {
      setSelectedNetwork(network);
      if (isRandomChain) {
        setNextStep();
      }
    },
    [isRandomChain, setNextStep, setSelectedNetwork],
  );

  const onSelectChain = useCallback(
    (chain: Maybe<number>) => {
      setSelectedChain(chain || selectedChains[0]);
      setNextStep();
    },
    [selectedChains, setNextStep, setSelectedChain],
  );

  const onSelectChainHandler = (chain: Maybe<number>) => {
    if (chain) {
      setChain(chain);
    }
  };

  const renderCards = useCallback(
    () => (
      <>
        <div ref={scrollContainerRef} className={styles.cards}>
          <RegistrationCard
            title="DevNet"
            iconType={2}
            description={t('engageWithLatestEnvironments')}
            buttonVariant="outlined"
            buttonLabel={t('select')}
            onSelect={() => onSelectNetwork(NetworkEnum.devnet)}
          />
          <RegistrationCard
            title="TestNet"
            iconType={3}
            description={t('exploreTestAndInnovate')}
            buttonVariant="contained"
            buttonLabel={t('select')}
            isWithBorder
            onSelect={() => onSelectNetwork(NetworkEnum.testnet)}
          />
          <RegistrationCard
            title="AppChains"
            iconType={3}
            description={t('connectDirectlyToDedicated')}
            buttonVariant="outlined"
            buttonLabel={t('select')}
            disabled={isRandomChain}
            onSelect={() => onSelectNetwork(NetworkEnum.appchain)}
          />
        </div>
        <IconButton className={styles.leftArrow} onClick={scrollToPrevious}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton className={styles.rightArrow} onClick={scrollToNext}>
          <ChevronRightIcon />
        </IconButton>
      </>
    ),
    [
      isRandomChain,
      onSelectNetwork,
      scrollContainerRef,
      scrollToNext,
      scrollToPrevious,
      t,
    ],
  );

  const renderSelectChain = useCallback(() => {
    const chainSelectItems = selectedChains.map((chain) => ({
      title: chain.toString(),
      value: chain,
    }));

    return (
      <div className={styles.selectChain}>
        <div className={styles.selectChainTitle}>{t('selectChain')}</div>
        <ChainSelect
          id="chain-select"
          name="chain-select"
          value={chain || selectedChains[0]}
          items={chainSelectItems}
          onChange={(props) => {
            onSelectChainHandler(props.target.value as number);
          }}
        />
        <div className={styles.selectChainDesc}>
          {t('selectChainNumberToRegister')}
        </div>
        <Button
          className={styles.button}
          variant="contained"
          size="large"
          onClick={() => onSelectChain(chain)}
        >
          {t('select')}
        </Button>
      </div>
    );
  }, [t, chain, onSelectChain, selectedChains]);

  return (
    <>
      <div className={registrationStyles.registrationSceneTitle}>
        {t('chooseDeInfraNetwork')}
      </div>
      {isRenderSelectChain ? renderSelectChain() : renderCards()}
    </>
  );
};

export const SelectNetwork = connector(SelectNetworkComponent);
