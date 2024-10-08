import React from 'react';
import { Modal, ModalProps } from './Modal';
import styles from './Modal.module.scss';
import { Loader } from '../loader/Loader';

export interface ModalLoaderProps extends ModalProps {
  loadingTitle: string;
}

export const ModalLoader: React.FC<ModalLoaderProps> = (
  props: ModalLoaderProps
) => {
  const { loadingTitle, ...modalProps } = props;

  return (
    <Modal {...modalProps} contentClassName={styles.modalLoader}>
      <Loader />
      <div className={styles.modalLoaderText}>{loadingTitle}</div>
    </Modal>
  );
};
