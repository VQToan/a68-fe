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
  performBacktestAction,
  clearCurrentProcess as clearCurrentProcessAction,
  clearError as clearErrorAction,
  getBacktestResult,
  clearBacktestResult,
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
  const result = useAppSelector((state) => state.backtest.result);
  const resultLoading = useAppSelector(
    (state) => state.backtest.resultLoading
  );
  const totalCount = useAppSelector((state) => state.backtest.processes.length);

  // Get all backtest processes (with optional status filtering)
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

  // Get backtest result by process ID
  const handleGetResult = useCallback(
    (id: string) => {
      return dispatch(getBacktestResult(id));
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

  // Perform an action on a backtest process (run, stop)
  const handlePerformAction = useCallback(
    async (id: string, action: "run" | "stop") => {
      try {
        await dispatch(performBacktestAction({ id, action })).unwrap();
        // Fetch updated list after action completes
        await dispatch(fetchBacktestProcesses({}));
        return true;
      } catch (error) {
        console.error("Failed to perform action:", error);
        return false;
      }
    },
    [dispatch]
  );

  // Clear current process
  const handleClearCurrentProcess = useCallback(() => {
    dispatch(clearCurrentProcessAction());
  }, [dispatch]);

  // Clear backtest result
  const handleClearResult = useCallback(() => {
    dispatch(clearBacktestResult());
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
    result,
    resultLoading,
    totalCount,
    getProcesses: handleGetProcesses,
    getProcessById: handleGetProcessById,
    getResult: handleGetResult,
    createProcess: handleCreateProcess,
    updateProcess: handleUpdateProcess,
    deleteProcess: handleDeleteProcess,
    performAction: handlePerformAction,
    clearCurrentProcess: handleClearCurrentProcess,
    clearResult: handleClearResult,
    clearError: handleClearError,
  };
};
