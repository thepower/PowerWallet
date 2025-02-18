import React, { useCallback, useRef } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import styles from './CopyButton.module.scss';
import { CopySvg } from '../../assets/icons';

interface CopyButtonProps {
  textButton: string;
  copyInfo?: string;
  className?: string;
  iconClassName?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  textButton,
  className,
  copyInfo,
  iconClassName
}) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLButtonElement>(null);
  const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      if (ref.current) {
        e?.stopPropagation();
        navigator.clipboard.writeText(
          copyInfo || ref.current.textContent || ''
        );
        toast.success(t('copiedToClipboard'));
      }
    },
    [copyInfo, t]
  );

  return (
    <button
      type='button'
      className={cn(styles.copyData, className)}
      ref={ref}
      onClick={handleClick}
    >
      {textButton}
      <CopySvg className={cn(styles.icon, iconClassName)} />
    </button>
  );
};

export default CopyButton;
