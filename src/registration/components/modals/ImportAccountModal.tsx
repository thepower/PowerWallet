import React from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Button, Modal, OutlinedInput } from 'common';
import styles from '../pages/registration/RegistrationPage.module.scss';

interface ImportAccountModalProps {
  open: boolean;
  onClose: (data?: any) => void;
  onSubmit: (data?: any) => void;
}

const initialValues = { password: '' };
type Values = typeof initialValues;

class ImportAccountModalComponent extends React.PureComponent<
  ImportAccountModalProps & WithTranslation
> {
  handleSubmitImportModal = (
    values: Values,
    formikHelpers: FormikHelpers<Values>
  ) => {
    const { onSubmit } = this.props;

    onSubmit(values.password);
    formikHelpers.setFieldValue('password', '');
  };

  render() {
    const { open, onClose } = this.props;

    return (
      <Modal
        contentClassName={styles.importModalContent}
        onClose={onClose}
        open={open}
      >
        <Formik
          initialValues={initialValues}
          onSubmit={this.handleSubmitImportModal}
        >
          {(formikProps) => (
            <Form className={styles.exportModalForm}>
              <div className={styles.exportModalTitleHolder}>
                <div className={styles.exportModalTitle}>
                  {this.props.t('importAccount')}
                </div>
                <div className={styles.exportModalTitle}>
                  {this.props.t('pleaseEnterYourPassword')}
                </div>
              </div>
              <OutlinedInput
                inputRef={(input) => input && input.focus()}
                placeholder={this.props.t('password')!}
                type={'password'}
                autoFocus
                errorMessage={formikProps.errors.password}
                size='small'
                error={
                  formikProps.touched.password &&
                  Boolean(formikProps.errors.password)
                }
                {...formikProps.getFieldProps('password')}
              />
              <Button
                size='medium'
                variant='contained'
                type='submit'
                disabled={!formikProps.dirty}
              >
                {this.props.t('next')}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    );
  }
}

export const ImportAccountModal = withTranslation()(
  ImportAccountModalComponent
);
