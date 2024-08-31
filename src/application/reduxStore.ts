import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import createSagaMiddleware from 'redux-saga';
import { tokensReducer } from 'myAssets/slices/tokensSlice';
import rootSaga from './sagas/rootSaga';
import { applicationDataReducer } from './slice/applicationSlice';
import { accountReducer } from '../account/slice/accountSlice';
import { transactionsReducer } from '../myAssets/slices/transactionsSlice';
import { walletReducer } from '../myAssets/slices/walletSlice';
import { networkReducer } from '../network/slice';
import { registrationReducer } from '../registration/slice/registrationSlice';
import { sendReducer } from '../send/slices/sendSlice';

const sagaMiddleware = createSagaMiddleware();

const tokensPersistConfig = {
  key: 'PowerWallet/tokens',
  storage
};

const reducer = {
  account: accountReducer,
  applicationData: applicationDataReducer,
  registration: registrationReducer,
  wallet: walletReducer,
  network: networkReducer,
  tokens: persistReducer(tokensPersistConfig, tokensReducer),
  transactions: transactionsReducer,
  send: sendReducer
};

const store = configureStore({
  reducer,
  // devTools: import.meta.env.MODE !== 'prod',
  devTools: false,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat([sagaMiddleware])
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const persistor = persistStore(store);

export { store, persistor };
