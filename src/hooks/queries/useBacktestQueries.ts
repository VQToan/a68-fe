import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@config/queryClient";
import * as backtestService from "@services/backtest.service";
import type {
  BacktestProcessCreate,
  BacktestProcessUpdate,
  BacktestStatus,
} from "@/types/backtest.type";

/**
 * Hook to fetch backtest processes list with status filter and pagination
 */
export const useBacktestsQuery = (
  status?: string,
  skip?: number,
  limit?: number
) => {
  return useQuery({
    queryKey: queryKeys.backtests.list({ status, skip, limit }),
    queryFn: () => backtestService.getBacktestProcesses(status, skip, limit),
  });
};

/**
 * Hook to fetch single backtest process by ID
 */
export const useBacktestByIdQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.backtests.detail(id!),
    queryFn: () => backtestService.getBacktestProcessById(id!),
    enabled: !!id,
  });
};

/**
 * Hook to fetch backtest processes by template ID
 */
export const useBacktestsByTemplateQuery = (
  templateId: string | undefined,
  status?: BacktestStatus
) => {
  return useQuery({
    queryKey: queryKeys.backtests.byTemplate(templateId!, status),
    queryFn: async () => {
      const response = await backtestService.getProcessesByTemplateId(
        templateId!,
        status
      );
      return response.data;
    },
    enabled: !!templateId,
  });
};

// =====================
// MUTATIONS
// =====================

/**
 * Hook to create a new backtest process
 */
export const useCreateBacktestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BacktestProcessCreate) =>
      backtestService.createBacktestProcess(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backtests.all });
    },
  });
};

/**
 * Hook to update a backtest process
 */
export const useUpdateBacktestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BacktestProcessUpdate }) =>
      backtestService.updateBacktestProcess(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backtests.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.backtests.detail(id),
      });
    },
  });
};

/**
 * Hook to delete a backtest process
 */
export const useDeleteBacktestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => backtestService.deleteBacktestProcess(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backtests.all });
    },
  });
};

/**
 * Hook to run a backtest process
 */
export const useRunBacktestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      params,
    }: {
      id: string;
      params: {
        start_date: number;
        end_date: number;
        combine_balance: boolean;
      };
    }) => backtestService.runBacktestProcess(id, params),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backtests.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.backtests.detail(id),
      });
    },
  });
};

/**
 * Hook to stop a backtest process
 */
export const useStopBacktestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => backtestService.stopBacktestProcess(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backtests.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.backtests.detail(id),
      });
    },
  });
};

/**
 * Hook to get query invalidation helpers
 */
export const useBacktestInvalidation = () => {
  const queryClient = useQueryClient();

  return {
    invalidateBacktests: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.backtests.all,
      }),
    invalidateBacktestsList: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.backtests.lists(),
      }),
    invalidateBacktestDetail: (id: string) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.backtests.detail(id),
      }),
    invalidateBacktestsByTemplate: (templateId: string) =>
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "backtests" &&
          query.queryKey[1] === "byTemplate" &&
          query.queryKey[2] === templateId,
      }),
  };
};

/**
 * Hook that provides callback-style API for compatibility with existing code
 */
export const useBacktest = () => {
  const [processesByTemplate, setProcessesByTemplate] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [currentProcess, setCurrentProcess] = useState<any | null>(null);
  const [isLoadingByTemplate, setIsLoadingByTemplate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProcessesByTemplateId = useCallback(
    async (templateId: string, status?: string) => {
      setIsLoadingByTemplate(true);
      try {
        const response = await backtestService.getProcessesByTemplateId(
          templateId,
          status as any
        );
        setProcessesByTemplate(response.data);
        setIsLoadingByTemplate(false);
        return response.data;
      } catch (err) {
        setIsLoadingByTemplate(false);
        throw err;
      }
    },
    []
  );

  const getProcessById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await backtestService.getBacktestProcessById(id);
      setCurrentProcess(data);
      setIsLoading(false);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch process";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const createProcess = useCallback(async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await backtestService.createBacktestProcess(data);
      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create process";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const getProcesses = useCallback(
    async (status?: string, skip?: number, limit?: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await backtestService.getBacktestProcesses(
          status,
          skip,
          limit
        );
        setProcesses(response.items);
        setIsLoading(false);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch processes";
        setError(errorMessage);
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  return {
    processesByTemplate,
    processes,
    currentProcess,
    isLoadingByTemplate,
    isLoading,
    error,
    getProcessesByTemplateId,
    getProcessById,
    createProcess,
    getProcesses,
  };
};
