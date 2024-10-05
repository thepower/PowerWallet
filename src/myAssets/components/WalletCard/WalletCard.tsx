import { FC, useMemo } from 'react';

import { lighten } from '@mui/material/styles';
import { useWalletsStore, Wallet } from 'application/utils/localStorageUtils';
import { useWalletData } from 'myAssets/hooks/useWalletData';
import styles from './WalletCard.module.scss';

const colors = [
  '#FF6F61', // Warm Red
  '#6B5B95', // Royal Purple
  '#88B04B', // Grass Green
  '#F7CAC9', // Pale Pink
  '#92A8D1', // Light Blue
  '#955251', // Dusty Rose
  '#B565A7', // Amethyst
  '#009473', // Teal
  '#DD4124', // Fiery Red
  '#D65076', // Pink Peacock
  '#45B8AC', // Mint
  '#EFC050', // Mustard
  '#5B5EA6', // Indigo Blue
  '#9B2335', // Red
  '#BC243C', // Scarlet
  '#982395', // Vivid Violet
  '#0072B5', // Azure Blue
  '#E15D44', // Burnt Orange
  '#55B4B0', // Turquoise
  '#E69A8D', // Blush
  '#F7CAC9', // Soft Pink
  '#E56399', // Rosy Pink
  '#6B5B95', // Majestic Purple
  '#88B04B', // Olive Green
  '#F4A460', // Sandy Brown
  '#00A591', // Ocean Green
  '#FF6F61', // Coral Red
  '#5F4B8B', // Ultra Violet
  '#F3D6E4', // Light Pink
  '#7F4A4A', // Mahogany
  '#CE3175', // Cerise
  '#8E44AD', // Purple
  '#27AE60', // Emerald Green
  '#2980B9', // Cobalt Blue
  '#D35400', // Pumpkin
  '#C0392B', // Cranberry Red
  '#BDC3C7', // Silver
  '#2C3E50', // Navy Blue
  '#34495E', // Slate Blue
  '#7B7D7D', // Gray
  '#16A085', // Greenish Cyan
  '#F39C12', // Sunflower
  '#F5CBA7', // Apricot
  '#EC7063', // Watermelon
  '#48C9B0', // Aqua Green
  '#FAD7A0', // Peach
  '#C39BD3', // Lavender
  '#AAB7B8', // Cloud Gray
  '#73C6B6', // Seafoam Green
  '#D5DBDB' // Light Gray
];

type WalletCardProps = {
  index: number;
  wallet: Wallet;
};

const WalletCard: FC<WalletCardProps> = ({ index, wallet }) => {
  const { walletData } = useWalletData(wallet);
  const { activeWallet, setActiveWalletByAddress } = useWalletsStore();

  const onClick = () => {
    setActiveWalletByAddress(wallet.address);
  };

  const isActive = useMemo(
    () => activeWallet?.address === wallet.address,
    [activeWallet?.address, wallet.address]
  );

  return (
    <div
      style={{
        backgroundColor: colors[index],
        borderColor: lighten(colors[index], 0.2),
        opacity: isActive ? 1 : 0.4
      }}
      onClick={onClick}
      className={styles.walletCard}
    >
      <div title={wallet.name} className={styles.name}>
        {wallet.name}
      </div>
      <div className={styles.chainId}>{wallet.chainId}</div>
      <div className={styles.balance}>
        {`${walletData?.amount?.SK || 0} SK`}
      </div>
      <div className={styles.address}>{wallet.address}</div>
    </div>
  );
};

export default WalletCard;
