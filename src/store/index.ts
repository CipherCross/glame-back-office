import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import { api } from 'store/api';
import authReducer from 'store/auth';
import reportsReducer from 'store/reports';
import settingsReducer from 'store/settings';

const rootReducer = combineReducers({
  auth: authReducer,
  reports: reportsReducer,
  settings: settingsReducer,
  [api.reducerPath]: api.reducer
});

const persistedReducer = persistReducer(
  {
    key: 'glame-back-office',
    version: 1,
    storage,
    whitelist: ['auth', 'reports', 'settings']
  },
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }).concat(api.middleware)
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
