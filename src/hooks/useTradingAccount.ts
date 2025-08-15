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
import * as tradingAccountService from '@services/tradingAccount.service';

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

  const getAccounts = (page?: number, page_size?: number, exchange?: TradingExchangeType) => {
    return dispatch(fetchTradingAccounts({ page, page_size, exchange }));
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

  // New dashboard functions
  const getAccountSummary = async (accountId: string) => {
    return await tradingAccountService.getAccountSummary(accountId);
  };

  const refreshAccountData = async (accountId: string) => {
    return await tradingAccountService.refreshAccountData(accountId);
  };

  const getAccountBalance = async (accountId: string) => {
    return await tradingAccountService.getAccountBalance(accountId);
  };

  const getPositions = async (accountId: string, symbol?: string) => {
    return await tradingAccountService.getPositions(accountId, symbol);
  };

  const openPosition = async (accountId: string, data: any) => {
    return await tradingAccountService.openPosition(accountId, data);
  };

  const closePosition = async (accountId: string, data: any) => {
    return await tradingAccountService.closePosition(accountId, data);
  };

  const closePartialPosition = async (accountId: string, data: any) => {
    return await tradingAccountService.closePartialPosition(accountId, data);
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
    // New dashboard functions
    getAccountSummary,
    refreshAccountData,
    getAccountBalance,
    getPositions,
    openPosition,
    closePosition,
    closePartialPosition,
  };
};
