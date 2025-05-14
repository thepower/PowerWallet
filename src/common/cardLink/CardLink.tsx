import React, { PropsWithChildren } from 'react';
import cn from 'classnames';
import { Link, LinkProps } from 'react-router-dom';
import styles from './CardLink.module.scss';

type CardLinkProps = LinkProps & {
  label: string;
  disabled?: boolean;
  isAnchor?: boolean;
};

const CardLink: React.FC<PropsWithChildren<CardLinkProps>> = ({
  children,
  className,
  label,
  disabled,
  isAnchor,
  ...linkProps
}) => {
  if (isAnchor) {
    return (
      <a
        {...linkProps}
        href={linkProps.to.toString()}
        aria-disabled={disabled}
        className={cn(styles.card, className)}
      >
        {children}
        <span className={styles.text}>{label}</span>
      </a>
    );
  }

  return (
    <Link
      {...linkProps}
      aria-disabled={disabled}
      className={cn(styles.card, className)}
    >
      {children}
      <span className={styles.text}>{label}</span>
    </Link>
  );
};

export default CardLink;
