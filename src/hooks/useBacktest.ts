import type {
  BacktestProcessCreate,
  BacktestProcessUpdate,
} from "@/types/backtest.type";
import { useAppSelector, useAppDispatch } from "./reduxHooks";
import {
  fetchBacktestProcesses,
  fetchBacktestProcessById,
  createBacktestProcess,
  updateBacktestProcess,
  deleteBacktestProcess,
  runBacktestProcess,
  stopBacktestProcess,
  clearCurrentProcess as clearCurrentProcessAction,
  clearError as clearErrorAction,
} from "@features/backtest/backtestSlice";
import { useCallback } from "react";

export const useBacktest = () => {
  const dispatch = useAppDispatch();

  // Use individual selectors for better performance
  const processes = useAppSelector((state) => state.backtest.processes);
  const currentProcess = useAppSelector(
    (state) => state.backtest.currentProcess
  );
  const isLoading = useAppSelector((state) => state.backtest.isLoading);
  const error = useAppSelector((state) => state.backtest.error);

  const pagination = useAppSelector((state) => state.backtest.pagination);

  // Get all backtest processes (with optional status filtering and pagination)
  const handleGetProcesses = useCallback(
    (status?: string, skip?: number, limit?: number) => {
      return dispatch(fetchBacktestProcesses({ status, skip, limit }));
    },
    [dispatch]
  );

  // Get backtest process by ID
  const handleGetProcessById = useCallback(
    (id: string) => {
      return dispatch(fetchBacktestProcessById(id));
    },
    [dispatch]
  );
  // Create a new backtest process
  const handleCreateProcess = useCallback(
    (processData: BacktestProcessCreate) => {
      return dispatch(createBacktestProcess(processData));
    },
    [dispatch]
  );

  // Update a backtest process
  const handleUpdateProcess = useCallback(
    (id: string, updates: BacktestProcessUpdate) => {
      return dispatch(updateBacktestProcess({ id, updates }));
    },
    [dispatch]
  );

  // Delete a backtest process
  const handleDeleteProcess = useCallback(
    (id: string) => {
      return dispatch(deleteBacktestProcess(id));
    },
    [dispatch]
  );

  // Run a backtest process with date parameters
  const handleRunProcess = useCallback(
    async (id: string, startDate: string, endDate: string) => {
      try {
        const params = {
          start_date: new Date(startDate).getTime(),
          end_date: new Date(endDate).getTime(),
        };
        await dispatch(runBacktestProcess({ id, params })).unwrap();
        // Fetch updated list after action completes
        await dispatch(fetchBacktestProcesses({}));
        return true;
      } catch (error) {
        console.error("Failed to run backtest:", error);
        return false;
      }
    },
    [dispatch]
  );

  // Stop a backtest process
  const handleStopProcess = useCallback(
    async (id: string) => {
      try {
        await dispatch(stopBacktestProcess(id)).unwrap();
        // Fetch updated list after action completes
        await dispatch(fetchBacktestProcesses({}));
        return true;
      } catch (error) {
        console.error("Failed to stop backtest:", error);
        return false;
      }
    },
    [dispatch]
  );

  // Clear current process
  const handleClearCurrentProcess = useCallback(() => {
    dispatch(clearCurrentProcessAction());
  }, [dispatch]);

  // Clear error
  const handleClearError = useCallback(() => {
    dispatch(clearErrorAction());
  }, [dispatch]);

  return {
    processes,
    currentProcess,
    isLoading,
    error,
    pagination,
    getProcesses: handleGetProcesses,
    getProcessById: handleGetProcessById,
    createProcess: handleCreateProcess,
    updateProcess: handleUpdateProcess,
    deleteProcess: handleDeleteProcess,
    runProcess: handleRunProcess,
    stopProcess: handleStopProcess,
    clearCurrentProcess: handleClearCurrentProcess,
    clearError: handleClearError,
  };
};
