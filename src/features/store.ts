import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import moduleReducer from './module/moduleSlice';
import backtestReducer from './backtest/backtestSlice';
import botTemplateReducer from './botTemplate/botTemplateSlice';
import botOptimizationReducer from './botOptimization/botOptimizationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    module: moduleReducer,
    backtest: backtestReducer,
    botTemplate: botTemplateReducer,
    botOptimization: botOptimizationReducer,
    // Add other reducers here as your application grows
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;