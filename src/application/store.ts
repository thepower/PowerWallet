import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { tokensReducer } from 'myAssets/slices/tokensSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import rootSaga from './sagas/rootSaga';
import history from './utils/history';
import { accountReducer } from '../account/slice/accountSlice';
import { applicationDataReducer } from './slice/applicationSlice';
import { registrationReducer } from '../registration/slice/registrationSlice';
import { networkReducer } from '../network/slice';
import { walletReducer } from '../myAssets/slices/walletSlice';
import { transactionsReducer } from '../myAssets/slices/transactionsSlice';
import { sendReducer } from '../send/slices/sendSlice';

const loggerMiddleware = createLogger({ collapsed: true });
const routeMiddleware = routerMiddleware(history);
const sagaMiddleware = createSagaMiddleware();

const tokensPersistConfig = {
  key: 'PowerWallet/tokens',
  storage,
};

const reducer = {
  router: connectRouter(history),
  account: accountReducer,
  applicationData: applicationDataReducer,
  registration: registrationReducer,
  wallet: walletReducer,
  network: networkReducer,
  tokens: persistReducer(tokensPersistConfig, tokensReducer),
  transactions: transactionsReducer,
  send: sendReducer,
};

const store = configureStore({
  reducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) => (
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat([loggerMiddleware, routeMiddleware, sagaMiddleware])
  ),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const persistor = persistStore(store);

export { store, persistor };
