import React, { FC, memo } from 'react';
import {
  FormControl, FormHelperText,
  OutlinedInput as MUIOutlinedInput,
  OutlinedInputProps as MUIOutlinedInputProps,
} from '@mui/material';
import { ClosedEyeIcon } from 'assets/icons/ClosedEyeIcon';
import { EyeIcon } from 'assets/icons/EyeIcon';
import styles from './Input.module.scss';

interface OutlinedInputProps extends MUIOutlinedInputProps {
  errorMessage?: string;
}

export const OutlinedInput: FC<OutlinedInputProps> = memo(({
  className, value, onChange, error, errorMessage, type, ...otherProps
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const getEndAdornment = () => {
    if (type === 'password') {
      return <div
        className={styles.passwordAdornment}
        onClick={toggleShowPassword}
      >
        { showPassword ? <ClosedEyeIcon /> : <EyeIcon /> }
      </div>;
    }

    return null;
  };

  const getInputType = (type: string) => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }

    return type;
  };

  return (
    <FormControl className={styles.formControl}>
      <MUIOutlinedInput
        className={className}
        value={value}
        onChange={onChange}
        type={getInputType(type!)}
        classes={{
          notchedOutline: value ? styles.bordered : '',
        }}
        endAdornment={getEndAdornment()}
        {...otherProps}
      />
      {
        error &&
        <FormHelperText className={styles.errorMessage}>
          {errorMessage}
        </FormHelperText>
      }
    </FormControl>
  );
});
