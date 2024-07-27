import { PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { put } from 'typed-redux-saga';
import i18n from 'locales/initTranslation';
import { startAction, stopAction } from 'network/slice';

const manageSagaState = (saga: any) =>
  function* (action: PayloadAction<any>) {
    try {
      yield* put(startAction({ name: action.type, params: action.payload }));
      yield* saga(action);
    } catch (err: any) {
      if (err.networkError) {
        toast.error(i18n.t('networkError'));
      } else {
        console.error(err);
      }
    } finally {
      yield* put(stopAction({ name: action.type, params: action.payload }));
    }
  };

export default manageSagaState;
