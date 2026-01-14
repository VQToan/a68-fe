import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@config/queryClient";
import * as backtestResultService from "@services/backtestResult.service";

/**
 * Hook to fetch backtest results by process ID
 */
export const useBacktestResultsByProcessQuery = (
  processId: string | undefined
) => {
  return useQuery({
    queryKey: queryKeys.backtestResults.byProcess(processId!),
    queryFn: () =>
      backtestResultService.getBacktestResultsByProcessId(processId!),
    enabled: !!processId,
  });
};

/**
 * Hook to fetch backtest result detail by result ID
 */
export const useBacktestResultDetailQuery = (resultId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.backtestResults.detail(resultId!),
    queryFn: () => backtestResultService.getBacktestResultDetail(resultId!),
    enabled: !!resultId,
  });
};

// =====================
// MUTATIONS
// =====================

/**
 * Hook to delete a backtest result
 */
export const useDeleteBacktestResultMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resultId: string) =>
      backtestResultService.deleteBacktestResult(resultId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.backtestResults.all,
      });
    },
  });
};

/**
 * Hook to get query invalidation helpers
 */
export const useBacktestResultInvalidation = () => {
  const queryClient = useQueryClient();

  return {
    invalidateBacktestResults: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.backtestResults.all,
      }),
    invalidateResultsByProcess: (processId: string) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.backtestResults.byProcess(processId),
      }),
    invalidateResultDetail: (resultId: string) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.backtestResults.detail(resultId),
      }),
  };
};

/**
 * Hook that provides callback-style functions for compatibility with existing code
 */
export const useBacktestResult = () => {
  const [resultsByProcess, setResultsByProcess] = useState<
    Record<string, any[]>
  >({});
  const [resultDetails, setResultDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBacktestResultsByProcessId = useCallback(
    async (processId: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await backtestResultService.getBacktestResultsByProcessId(
          processId
        );
        setResultsByProcess((prev) => ({
          ...prev,
          [processId]: data,
        }));
        setLoading(false);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch results";
        setError(errorMessage);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  const getResultDetail = useCallback(async (resultId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await backtestResultService.getBacktestResultDetail(
        resultId
      );
      setResultDetails((prev) => ({
        ...prev,
        [resultId]: data,
      }));
      setLoading(false);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch result";
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  const deleteBacktestResult = useCallback(async (resultId: string) => {
    setLoading(true);
    setError(null);
    try {
      await backtestResultService.deleteBacktestResult(resultId);
      // Remove from resultsByProcess
      setResultsByProcess((prev) => {
        const newState: Record<string, any[]> = {};
        for (const [processId, results] of Object.entries(prev)) {
          newState[processId] = results.filter((r: any) => r._id !== resultId);
        }
        return newState;
      });
      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete result";
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  const clearCurrentResult = useCallback(() => {
    // No-op for compatibility
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    resultsByProcess,
    resultDetails,
    loading,
    isLoading: loading,
    error,
    getBacktestResultsByProcessId,
    getResultsByProcessId: getBacktestResultsByProcessId, // Alias
    getResultDetail,
    deleteBacktestResult,
    deleteResult: deleteBacktestResult, // Alias
    clearCurrentResult,
    clearError,
  };
};
