import React, { memo } from 'react';
import classnames from 'classnames';
import { ThreeLayersIcon, TwoLayersIcon, OneLayersIcon } from 'assets/icons';
import { Button } from 'common';
import styles from './RegistrationCard.module.scss';

interface RegistrationCardProps {
  className?: string;
  title: string;
  description: string;
  buttonVariant: 'outlined' | 'contained';
  iconType: 1 | 2 | 3;
  buttonLabel?: string;
  isWithBorder?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

const RegistrationCardComponent: React.FC<RegistrationCardProps> = memo(
  ({
    className,
    title,
    description,
    iconType,
    buttonVariant,
    isWithBorder,
    disabled,
    buttonLabel,
    onSelect,
  }) => {
    const renderIcon = () => {
      switch (iconType) {
        case 1:
          return <OneLayersIcon />;
        case 2:
          return <TwoLayersIcon />;
        case 3:
          return <ThreeLayersIcon />;
        default:
          return null;
      }
    };
    return (
      <div
        className={classnames(
          styles.registrationCard,
          isWithBorder && styles.withBorder,
          disabled && styles.disabled,
          className,
        )}
      >
        <div className={styles.title}>{title}</div>
        {renderIcon()}
        <div className={styles.description}>{description}</div>
        <Button
          className={styles.selectButton}
          variant={buttonVariant}
          size="large"
          onClick={onSelect}
        >
          {buttonLabel || 'Select'}
        </Button>
      </div>
    );
  },
);

export const RegistrationCard = RegistrationCardComponent;
