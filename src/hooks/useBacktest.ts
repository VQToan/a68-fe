import type { BacktestProcessCreate, BacktestProcessUpdate } from '@/types/backtest.type';
import { useAppSelector, useAppDispatch } from './reduxHooks';
import {
  fetchBacktestProcesses,
  fetchBacktestProcessById,
  createBacktestProcess,
  updateBacktestProcess,
  deleteBacktestProcess,
  performBacktestAction,
  clearCurrentProcess as clearCurrentProcessAction,
  clearError as clearErrorAction
} from '@features/backtest/backtestSlice';

export const useBacktest = () => {
  const dispatch = useAppDispatch();
  const backtestState = useAppSelector((state) => state.backtest);

  // Get all backtest processes (with optional status filtering)
  const handleGetProcesses = (status?: string, skip?: number, limit?: number) => {
    return dispatch(fetchBacktestProcesses({ status, skip, limit }));
  };

  // Get backtest process by ID
  const handleGetProcessById = (id: string) => {
    return dispatch(fetchBacktestProcessById(id));
  };

  // Create a new backtest process
  const handleCreateProcess = (processData: BacktestProcessCreate) => {
    return dispatch(createBacktestProcess(processData));
  };

  // Update a backtest process
  const handleUpdateProcess = (id: string, updates: BacktestProcessUpdate) => {
    return dispatch(updateBacktestProcess({ id, updates }));
  };

  // Delete a backtest process
  const handleDeleteProcess = (id: string) => {
    return dispatch(deleteBacktestProcess(id));
  };

  // Perform an action on a backtest process (run, stop)
  const handlePerformAction = (id: string, action: 'run' | 'stop') => {
    return dispatch(performBacktestAction({ id, action }));
  };

  // Clear current process
  const handleClearCurrentProcess = () => {
    dispatch(clearCurrentProcessAction());
  };

  // Clear error
  const handleClearError = () => {
    dispatch(clearErrorAction());
  };

  return {
    ...backtestState,
    getProcesses: handleGetProcesses,
    getProcessById: handleGetProcessById,
    createProcess: handleCreateProcess,
    updateProcess: handleUpdateProcess,
    deleteProcess: handleDeleteProcess,
    performAction: handlePerformAction,
    clearCurrentProcess: handleClearCurrentProcess,
    clearError: handleClearError,
  };
};