import { FC } from 'react';
import styles from './Account.module.scss';
import { AccountActionType } from '../typings/accountTypings';

interface AccountActionsListProps {
  actions: AccountActionType[];
}

const AccountActionsListComponent: FC<AccountActionsListProps> = ({
  actions
}) => {
  const renderActionItem = (item: AccountActionType) => {
    const { Icon, title, action } = item;

    return (
      <div className={styles.accountAction} key={title} onClick={action}>
        <Icon className={styles.icon} />
        <span className={styles.accountActionText}>{title}</span>
      </div>
    );
  };

  return (
    <div className={styles.accountActionsHolder}>
      {actions.map(renderActionItem)}
    </div>
  );
};

export const AccountActionsList = AccountActionsListComponent;
