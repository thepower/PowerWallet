import React from 'react';
import cn from 'classnames';
import styles from './IconButton.module.scss';

interface IconButtonProps {
  className?: string;
  children: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
  children,
  onClick,
  className,
  disabled
}) => (
  <button
    type='button'
    onClick={onClick}
    className={cn(styles.button, className)}
    disabled={disabled}
  >
    {children}
  </button>
);

export default IconButton;
