import React, { useCallback, useMemo } from 'react';
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
import { Button, WizardComponentProps } from 'common';
import registrationStyles from '../../Registration.module.scss';
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

type SelectNetworkProps = ConnectedProps<typeof connector> & WizardComponentProps;

export const SelectNetworkComponent: React.FC<SelectNetworkProps> = ({
  selectedNetwork,
  isRandomChain,
  setSelectedNetwork,
  setSelectedChain,
  networksChains,
  setNextStep,
}) => {
  const { t } = useTranslation();
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
      <div className={styles.cards}>
        <RegistrationCard
          title="DevNet"
          iconType={2}
          description="Engage with latest environments to try out features before it go live"
          buttonVariant="outlined"
          onSelect={() => onSelectNetwork(NetworkEnum.devnet)}
        />
        <RegistrationCard
          title="TestNet"
          iconType={3}
          description="Explore, test, and innovate with decentralized web"
          buttonVariant="contained"
          isWithBorder
          onSelect={() => onSelectNetwork(NetworkEnum.testnet)}
        />
        <RegistrationCard
          title="AppChains"
          iconType={3}
          description="Connect directly to dedicated application chains"
          buttonVariant="outlined"
          disabled={isRandomChain}
          onSelect={() => onSelectNetwork(NetworkEnum.appchain)}
        />
      </div>
    ),
    [isRandomChain, onSelectNetwork],
  );

  const renderSelectChain = useCallback(() => {
    const chainSelectItems = selectedChains.map((chain) => ({
      title: chain.toString(),
      value: chain,
    }));

    return (
      <div className={styles.selectChain}>
        <div className={styles.selectChainTitle}>Select chain</div>
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
          Select the chain number to register an account
        </div>
        <Button
          className={styles.button}
          variant="contained"
          size="large"
          onClick={() => onSelectChain(chain)}
        >
          Select
        </Button>
      </div>
    );
  }, [chain, onSelectChain, selectedChains]);

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
