import { RootState } from 'application/store';
import { Button, Tabs, WizardComponentProps } from 'common';
import React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';
import {
  getCurrentCreatingStep,
  getCurrentRegistrationTab,
  getSelectedChain,
  getLoginData,
} from '../../../selectors/registrationSelectors';
import {
  generateSeedPhrase,
  loginToWalletFromRegistration,
  setCurrentRegisterCreateAccountTab,
  setPasswordNotEqual,
} from '../../../slice/registrationSlice';
import {
  CreateAccountStepsEnum,
  LoginRegisterAccountTabs,
  getLoginRegisterAccountTabsLabels, getLoginRegisterAccountTabsLabelsShort,
} from '../../../typings/registrationTypes';
import { compareTwoStrings } from '../../../utils/registrationUtils';
import styles from '../../Registration.module.scss';
import { RegistrationBackground } from '../../common/registrationBackground/RegistrationBackground';
import { CreateNewAccount } from './CreateNewAccount';
import { LoginToAccount } from './LoginToAccount';
import { ImportAccount } from './import/ImportAccount';

const mapStateToProps = (state: RootState) => ({
  tab: getCurrentRegistrationTab(state),
  selectedChain: getSelectedChain(state),
  creatingStep: getCurrentCreatingStep(state),
  ...getLoginData(state),
});

const mapDispatchToProps = {
  setCurrentRegisterCreateAccountTab,
  generateSeedPhrase,
  setPasswordNotEqual,
  loginToWalletFromRegistration,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type LoginRegisterAccountProps = ConnectedProps<typeof connector> & WizardComponentProps & WithTranslation;

interface LoginRegisterAccountState {
  isMobile: boolean;
}

class LoginRegisterAccountComponent extends React.PureComponent<LoginRegisterAccountProps, LoginRegisterAccountState> {
  constructor(props: LoginRegisterAccountProps) {
    super(props);

    this.state = {
      isMobile: window.innerWidth < 768,
    };
  }

  onChangeTab = (_event: React.SyntheticEvent, value: LoginRegisterAccountTabs) => {
    this.props.setCurrentRegisterCreateAccountTab(value);
  };

  getPageContent = () => {
    const {
      tab,
      setNextStep,
      address,
      seed,
      password,
      confirmedPassword,
      passwordsNotEqual,
      isRandomChain,
    } = this.props;

    switch (tab) {
      case LoginRegisterAccountTabs.create:
        return <CreateNewAccount
          setNextStep={setNextStep}
          isRandomChain={isRandomChain}
        />;
      case LoginRegisterAccountTabs.login:
        return <LoginToAccount
          address={address}
          confirmedPassword={confirmedPassword}
          password={password}
          passwordsNotEqual={passwordsNotEqual}
          seed={seed}
        />;
      case LoginRegisterAccountTabs.import:
        return <ImportAccount />;
      default:
        return null;
    }
  };

  getButtonDisabled = () => {
    const {
      selectedChain,
      tab,
      address,
      seed,
      password,
      confirmedPassword,
      passwordsNotEqual,
      isRandomChain,
    } = this.props;

    if (tab === LoginRegisterAccountTabs.create) {
      return !isRandomChain && !selectedChain;
    }

    return !address || !seed || passwordsNotEqual || !password || !confirmedPassword;
  };

  handleButtonClick = () => {
    const {
      tab,
      generateSeedPhrase,
      address,
      seed,
      password,
      confirmedPassword,
      setPasswordNotEqual,
    } = this.props;

    if (tab === LoginRegisterAccountTabs.create) {
      generateSeedPhrase();
      return;
    }

    const passwordsNotEqual = !compareTwoStrings(password!, confirmedPassword!);

    if (passwordsNotEqual) {
      setPasswordNotEqual(true);
      return;
    }

    loginToWalletFromRegistration({
      address: address!,
      seedOrPrivateKey: seed!,
      password: password!,
    });
  };

  render() {
    const { tab, setNextStep, isRandomChain } = this.props;
    const { isMobile } = this.state;

    if (this.props.creatingStep !== CreateAccountStepsEnum.selectChain) {
      return <CreateNewAccount
        setNextStep={setNextStep}
        isRandomChain={isRandomChain}
      />;
    }

    return <div className={styles.registrationComponent}>
      <RegistrationBackground>
        <div className={styles.loginRegisterAccountTitle}>
          {this.props.t('createLoginImport')}
        </div>
        <div className={styles.loginRegisterAccountHolder}>
          <Tabs
            tabs={LoginRegisterAccountTabs}
            tabsLabels={isMobile ? getLoginRegisterAccountTabsLabelsShort() : getLoginRegisterAccountTabsLabels()}
            value={tab}
            onChange={this.onChangeTab}
          />
          {this.getPageContent()}
        </div>
      </RegistrationBackground>
      <div className={styles.registrationButtonsHolder}>
        {
          tab !== LoginRegisterAccountTabs.import &&
          <Button
            size="medium"
            variant="filled"
            type="button"
            onClick={this.handleButtonClick}
            disabled={this.getButtonDisabled()}
          >
            {this.props.t('next')}
          </Button>
        }
      </div>
    </div>;
  }
}

export const RegisterPage = withTranslation()(connector(LoginRegisterAccountComponent));
