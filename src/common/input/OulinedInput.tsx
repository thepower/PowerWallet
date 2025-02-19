import React, { FC, memo } from 'react';
import {
  FormControl,
  FormHelperText,
  OutlinedInput as MUIOutlinedInput,
  OutlinedInputProps as MUIOutlinedInputProps
} from '@mui/material';
import { ClosedEyeIcon } from 'assets/icons/ClosedEyeIcon';
import { EyeIcon } from 'assets/icons/EyeIcon';
import styles from './OutlinedInput.module.scss';

interface OutlinedInputProps extends MUIOutlinedInputProps {
  errorMessage?: string;
}

export const OutlinedInput: FC<OutlinedInputProps> = memo(
  ({
    className,
    value,
    onChange,
    error,
    errorMessage,
    type,
    ...otherProps
  }) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const toggleShowPassword = () => {
      setShowPassword(!showPassword);
    };

    const getEndAdornment = () => {
      if (type === 'password') {
        return (
          <div
            className={styles.passwordAdornment}
            onClick={toggleShowPassword}
          >
            {showPassword ? <ClosedEyeIcon /> : <EyeIcon />}
          </div>
        );
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
      <FormControl className={styles.formControl} error={error}>
        <MUIOutlinedInput
          className={className}
          value={value}
          onChange={onChange}
          type={getInputType(type!)}
          classes={{
            notchedOutline: value ? styles.bordered : ''
          }}
          error={error}
          endAdornment={getEndAdornment()}
          {...otherProps}
        />
        {error && (
          <FormHelperText error={error} className={styles.errorMessage}>
            {errorMessage}
          </FormHelperText>
        )}
      </FormControl>
    );
  }
);
