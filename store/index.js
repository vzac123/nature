import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import counterReducer from './counterSlice'; // example slice
import authReducer from './authSlice';

const rootReducer = combineReducers({
  counter: counterReducer,
  auth: authReducer,
  // add more slices here
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['counter', 'auth'], // slices you want to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
