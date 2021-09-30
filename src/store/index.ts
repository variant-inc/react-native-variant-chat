import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';

import { rootReducer } from './rootReducer';

// redux-persist is pushing a function into a reducer (not best practice)
// it has insisted not to fix the issue, but toolkit has an escape-hatch:
// we tell toolkit to ignore serializable inspection on redux-persist actions
// https://github.com/rt2zz/redux-persist/issues/988
const ignoredActions = [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER];

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: [],
  transforms: [],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  devTools: false,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions,
    },
  }),
});
export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = (): any => useDispatch<AppDispatch>();
