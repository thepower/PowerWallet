import React, { FC } from 'react';
import { Button, ButtonProps } from '@mui/material';
import styles from './AddButton.module.scss';

type AddButtonProps = ButtonProps;

const AddButton: FC<AddButtonProps> = ({ children, ...props }) => {
  return (
    <Button {...props} size='small' classes={{ root: styles.root }}>
      {children}
    </Button>
  );
};

export default AddButton;
