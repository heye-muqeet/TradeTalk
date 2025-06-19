import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage, 
  whitelist: ['appState'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store: any = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    }),
  // devTools: process.env.NODE_ENV !== 'production',
});

const persistor = persistStore(store);

export { store, persistor };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

