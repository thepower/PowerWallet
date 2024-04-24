import React from 'react';

import { Account } from '../../account/components/Account';
import styles from './ShallowPageTemplate.module.scss';

const ShallowPageTemplate: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.template}>
    <aside className={styles.aside}>
      <header className={styles.header}>
        <p className={styles.logo}>Power Wallet</p>
        <Account />
      </header>
    </aside>
    <div className={styles.content}>
      {children}
    </div>
  </div>
);

export default ShallowPageTemplate;
