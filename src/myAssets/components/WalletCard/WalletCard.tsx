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
  const { getNativeTokenAmountBySymbol } = useWalletData(wallet);
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
      toast.success(t('copiedToClipboard'));
    },
    [wallet?.address, t]
  );

  const SK = getNativeTokenAmountBySymbol('SK');
  const fixedSK = SK ? parseFloat(SK.formattedAmount).toFixed(3) : '0';

  return (
    <div
      onClick={onClick}
      className={cn(styles.walletCard, isActive && styles.walletCardActive)}
    >
      <div title={wallet.name} className={styles.name}>
        {wallet.name.length > 20
          ? `${wallet.name.substring(0, 20)}...`
          : wallet.name}
      </div>
      <button type='button' className={cn(styles.copyAddressButton)}>
        {wallet?.address}
        <CopySvg onClick={handleClick} className={styles.copyAddressIcon} />
      </button>
      <div className={styles.chainId}>
        {t('chain')}: {wallet.chainId}
      </div>
      <div title={fixedSK || '0'} className={styles.balance}>
        {`${fixedSK} SK`}
      </div>
    </div>
  );
};

export default WalletCard;
