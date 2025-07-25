import { useAppDispatch, useAppSelector } from './reduxHooks';
import {
  fetchTradingProcesses,
  fetchTradingProcessById,
  createTradingProcess,
  updateTradingProcess,
  deleteTradingProcess,
  startTradingProcess,
  stopTradingProcess,
  fetchRunningTradingProcesses,
  clearError,
  clearCurrentProcess,
} from '@features/tradingProcess/tradingProcessSlice';
import type { TradingProcessCreate, TradingProcessUpdate, TradingStatusType } from '@/types/trading.types';

export const useTradingProcess = () => {
  const dispatch = useAppDispatch();
  const {
    processes,
    currentProcess,
    pagination,
    runningProcesses,
    isLoading,
    error,
  } = useAppSelector((state) => state.tradingProcess);

  const getProcesses = (status?: TradingStatusType, skip?: number, limit?: number) => {
    return dispatch(fetchTradingProcesses({ status, skip, limit }));
  };

  const getProcessById = (id: string) => {
    return dispatch(fetchTradingProcessById(id));
  };

  const createProcess = (data: TradingProcessCreate) => {
    return dispatch(createTradingProcess(data));
  };

  const updateProcess = (id: string, data: TradingProcessUpdate) => {
    return dispatch(updateTradingProcess({ id, data }));
  };

  const deleteProcess = (id: string) => {
    return dispatch(deleteTradingProcess(id));
  };

  const startProcess = (id: string) => {
    return dispatch(startTradingProcess(id));
  };

  const stopProcess = (id: string) => {
    return dispatch(stopTradingProcess(id));
  };

  const getRunningProcesses = () => {
    return dispatch(fetchRunningTradingProcesses());
  };

  const clearErrorState = () => {
    dispatch(clearError());
  };

  const clearCurrentProcessState = () => {
    dispatch(clearCurrentProcess());
  };

  return {
    processes,
    currentProcess,
    pagination,
    runningProcesses,
    isLoading,
    error,
    getProcesses,
    getProcessById,
    createProcess,
    updateProcess,
    deleteProcess,
    startProcess,
    stopProcess,
    getRunningProcesses,
    clearError: clearErrorState,
    clearCurrentProcess: clearCurrentProcessState,
  };
};
