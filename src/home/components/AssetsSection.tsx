import React from 'react';
import {
  BuySvg, FaucetSvg, LogoIcon, SendSvg, WalletsSvg,
} from 'common/icons';
import { connect, ConnectedProps } from 'react-redux';
import { ArrowLink, CardLink, CopyButton } from 'common';
import { isHub } from 'application/components/AppRoutes';
import { faucetThePowerUrl, walletThePowerUrl } from 'appConstants';
import { t } from 'i18next';
import { getWalletAddress } from '../../account/selectors/accountSelectors';
import { getWalletNativeTokensAmounts } from '../../myAssets/selectors/walletSelectors';
import { setShowUnderConstruction } from '../../application/slice/applicationSlice';
import { RootState } from '../../application/store';
import styles from './AssetsSection.module.scss';
import { WalletRoutesEnum } from '../../application/typings/routes';

const mapStateToProps = (state: RootState) => ({
  walletAddress: getWalletAddress(state),
  amounts: getWalletNativeTokensAmounts(state),
});
const mapDispatchToProps = {
  setShowUnderConstruction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type AssetsSectionProps = ConnectedProps<typeof connector>;

const AssetsSection = ({ walletAddress, setShowUnderConstruction, amounts }: AssetsSectionProps) => {
  const handleShowUnderConstruction = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();

      setShowUnderConstruction(true);
    },
    [setShowUnderConstruction],
  );

  return (
    <div>
      <ArrowLink
        disabled={!walletAddress}
        size="large"
        direction="right"
        to="my-assets"
      >
        {t('myAssets')}
      </ArrowLink>
      <div className={styles.box}>
        <div className={styles.majorWallet}>
          <p className={styles.total}>
            <LogoIcon className={styles.icon} />
            {!amounts?.SK || amounts?.SK === '0' ? <span className={styles.emptyTitle}>{t('yourTokensWillBeHere')}</span> : amounts.SK}
          </p>
          {walletAddress && <CopyButton
            textButton={walletAddress}
            className={styles.addressButton}
            iconClassName={styles.copyIcon}
          />}
        </div>
        <div className={styles.cards}>
          <CardLink
            to={'/my-assets'}
            label="Wallets"
            disabled={!walletAddress}
          >
            <WalletsSvg />
          </CardLink>
          <CardLink label={t('faucet')} isAnchor to={faucetThePowerUrl} target="_blank" rel="noreferrer">
            <FaucetSvg />
          </CardLink>
          <CardLink
            isAnchor={isHub}
            to={isHub
              ? `${walletThePowerUrl}${WalletRoutesEnum.myAssets}${WalletRoutesEnum.assetSelection}`
              : `${WalletRoutesEnum.myAssets}${WalletRoutesEnum.assetSelection}`}
            label={t('send')}
            target={isHub ? '_blank' : '_self'}
          >
            <SendSvg />
          </CardLink>
          <CardLink
            isAnchor={isHub}
            to={isHub
              ? `${walletThePowerUrl}${WalletRoutesEnum.buy}`
              : WalletRoutesEnum.buy}
            label={t('buy')}
            target={isHub ? '_blank' : '_self'}
            onClick={handleShowUnderConstruction}
          >
            <BuySvg />
          </CardLink>
        </div>
      </div>
    </div>
  );
};

export default connector(AssetsSection);
