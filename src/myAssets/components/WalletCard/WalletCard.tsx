import { FC, useCallback, useMemo } from 'react';

import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useWalletsStore, Wallet } from 'application/utils/localStorageUtils';
import { CopySvg } from 'assets/icons';
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

  const handleClick = useCallback<React.MouseEventHandler<SVGSVGElement>>(
    (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(wallet?.address || '');
      toast.success('Copied to clipboard');
    },
    [wallet?.address]
  );

  return (
    <div
      onClick={onClick}
      className={cn(styles.walletCard, isActive && styles.walletCardActive)}
    >
      <div className={styles.name}>{wallet?.name || ''}</div>
      <button type='button' className={cn(styles.copyAddressButton)}>
        {wallet?.address}
        <CopySvg onClick={handleClick} className={styles.copyAddressIcon} />
      </button>
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
