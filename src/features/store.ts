import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import moduleReducer from './module/moduleSlice';
import backtestReducer from './backtest/backtestSlice';
import backtestResultReducer from './backtestResult/backtestResultSlice';
import botTemplateReducer from './botTemplate/botTemplateSlice';
import botOptimizationReducer from './botOptimization/botOptimizationSlice';
import tradingProcessReducer from './tradingProcess/tradingProcessSlice';
import tradingAccountReducer from './tradingAccount/tradingAccountSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    module: moduleReducer,
    backtest: backtestReducer,
    backtestResult: backtestResultReducer,
    botTemplate: botTemplateReducer,
    botOptimization: botOptimizationReducer,
    tradingProcess: tradingProcessReducer,
    tradingAccount: tradingAccountReducer,
    // Add other reducers here as your application grows
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;