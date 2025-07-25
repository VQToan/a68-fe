import { useAppDispatch, useAppSelector } from './reduxHooks';
import {
  fetchTradingAccounts,
  fetchTradingAccountById,
  createTradingAccount,
  updateTradingAccount,
  deleteTradingAccount,
  fetchActiveTradingAccounts,
  clearError,
  clearCurrentAccount,
} from '@features/tradingAccount/tradingAccountSlice';
import type { TradingAccountCreate, TradingAccountUpdate, TradingExchangeType } from '@/types/trading.types';

export const useTradingAccount = () => {
  const dispatch = useAppDispatch();
  const {
    accounts,
    activeAccounts,
    currentAccount,
    pagination,
    isLoading,
    error,
  } = useAppSelector((state) => state.tradingAccount);

  const getAccounts = (page?: number, page_size?: number, is_active?: boolean, exchange?: TradingExchangeType) => {
    return dispatch(fetchTradingAccounts({ page, page_size, is_active, exchange }));
  };

  const getAccountById = (id: string) => {
    return dispatch(fetchTradingAccountById(id));
  };

  const createAccount = (data: TradingAccountCreate) => {
    return dispatch(createTradingAccount(data));
  };

  const updateAccount = (id: string, data: TradingAccountUpdate) => {
    return dispatch(updateTradingAccount({ id, data }));
  };

  const deleteAccount = (id: string) => {
    return dispatch(deleteTradingAccount(id));
  };

  const getActiveAccounts = () => {
    return dispatch(fetchActiveTradingAccounts());
  };

  const clearErrorState = () => {
    dispatch(clearError());
  };

  const clearCurrentAccountState = () => {
    dispatch(clearCurrentAccount());
  };

  return {
    accounts,
    activeAccounts,
    currentAccount,
    pagination,
    isLoading,
    error,
    getAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount,
    getActiveAccounts,
    clearError: clearErrorState,
    clearCurrentAccount: clearCurrentAccountState,
  };
};
