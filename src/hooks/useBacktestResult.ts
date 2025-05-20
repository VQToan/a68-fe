import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import {
  fetchBacktestResultsByProcessId,
  fetchBacktestResultDetail,
  removeBacktestResult,
  clearBacktestResults,
  clearBacktestResultDetail,
} from "@/features/backtestResult/backtestResultSlice";
import type {
  BacktestResultDetail,
  BacktestResultSummary,
} from "@/types/backtestResult.type";

/**
 * Hook for managing backtest results
 */
export const useBacktestResult = () => {
  const dispatch = useAppDispatch();
  const { resultsByProcess, resultDetails, loading, error, loadingDetail } =
    useAppSelector((state) => state.backtestResult);

  /**
   * Fetch all backtest results for a specific process ID
   */
  const getBacktestResultsByProcessId = useCallback(
    async (processId: string) => {
      return dispatch(fetchBacktestResultsByProcessId(processId)).unwrap();
    },
    [dispatch]
  );

  /**
   * Get results for a specific process, either from cache or fetch if not available
   */
  const getResultsForProcess = useCallback(
    async (processId: string): Promise<BacktestResultSummary[]> => {
      // Return cached results if available
      if (resultsByProcess[processId]) {
        return resultsByProcess[processId];
      }

      // Otherwise fetch from API
      return dispatch(fetchBacktestResultsByProcessId(processId)).unwrap();
    },
    [dispatch, resultsByProcess]
  );

  /**
   * Fetch detailed backtest result by result ID
   */
  const getBacktestResultDetail = useCallback(
    async (resultId: string) => {
      return dispatch(fetchBacktestResultDetail(resultId)).unwrap();
    },
    [dispatch]
  );

  /**
   * Get detailed result, either from cache or fetch if not available
   */
  const getResultDetail = useCallback(
    async (resultId: string): Promise<BacktestResultDetail> => {
      // Return cached detail if available
      if (resultDetails[resultId]) {
        return resultDetails[resultId];
      }

      // Otherwise fetch from API
      return dispatch(fetchBacktestResultDetail(resultId)).unwrap();
    },
    [dispatch, resultDetails]
  );

  /**
   * Delete a backtest result
   */
  const deleteBacktestResult = useCallback(
    async (resultId: string) => {
      return dispatch(removeBacktestResult(resultId)).unwrap();
    },
    [dispatch]
  );

  /**
   * Clear all backtest results from the state
   */
  const clearAllResults = useCallback(() => {
    dispatch(clearBacktestResults());
  }, [dispatch]);

  /**
   * Clear a specific backtest result detail from the state
   */
  const clearResultDetail = useCallback(
    (resultId: string) => {
      dispatch(clearBacktestResultDetail(resultId));
    },
    [dispatch]
  );

  // Create a memoized value of the current results and details
  const cachedResults = useMemo(
    () => ({
      resultsByProcess,
      resultDetails,
    }),
    [resultsByProcess, resultDetails]
  );

  return {
    // Data
    ...cachedResults,
    loadingDetail,
    loading,
    error,

    // Actions
    getBacktestResultsByProcessId,
    getResultsForProcess,
    getBacktestResultDetail,
    getResultDetail,
    deleteBacktestResult,
    clearAllResults,
    clearResultDetail,
  };
};
