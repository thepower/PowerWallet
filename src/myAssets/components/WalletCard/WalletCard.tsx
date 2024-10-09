import { FC, useMemo } from 'react';

import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { useWalletsStore, Wallet } from 'application/utils/localStorageUtils';
import { CopyButton } from 'common';
import { useWalletData } from 'myAssets/hooks/useWalletData';
import styles from './WalletCard.module.scss';

type WalletCardProps = {
  wallet: Wallet;
  onSelectWallet?: () => void;
};

const WalletCard: FC<WalletCardProps> = ({ wallet, onSelectWallet }) => {
  const { t } = useTranslation();
  const { walletData } = useWalletData(wallet);
  const { activeWallet, setActiveWalletByAddress } = useWalletsStore();

  const onClick = () => {
    setActiveWalletByAddress(wallet.address);
    onSelectWallet?.();
  };

  const isActive = useMemo(
    () => activeWallet?.address === wallet.address,
    [activeWallet?.address, wallet.address]
  );

  return (
    <div
      onClick={onClick}
      className={cn(styles.walletCard, isActive && styles.walletCardActive)}
    >
      <div className={styles.name}>{wallet?.name || ''}</div>
      <CopyButton
        textButton={wallet?.address || ''}
        className={styles.addressButton}
        iconClassName={styles.copyIcon}
      />
      <div className={styles.chainId}>
        {t('chain')}: {wallet.chainId}
      </div>
      <div
        title={walletData?.amount?.SK?.toString() || '0'}
        className={styles.balance}
      >
        {`${walletData?.amount?.SK?.toFixed(2) || 0} SK`}
      </div>
    </div>
  );
};

export default WalletCard;
