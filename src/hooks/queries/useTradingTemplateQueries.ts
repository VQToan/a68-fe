import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@config/queryClient";
import * as tradingTemplateService from "@services/tradingTemplate.service";
import type {
  ReleaseTemplateInput,
  ToggleActiveInput,
  TradingTemplateUpdate,
} from "@/types/tradingTemplate.type";

/**
 * Hook to fetch all active trading templates (Public)
 */
export const useTradingTemplatesQuery = () => {
  return useQuery({
    queryKey: queryKeys.tradingTemplates.list(), // Ensure this key exists or add it to queryKeys
    queryFn: () => tradingTemplateService.getTradingTemplates(),
  });
};

/**
 * Hook to fetch a single trading template (Public)
 */
export const useTradingTemplateByIdQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.tradingTemplates.detail(id!),
    queryFn: () => tradingTemplateService.getTradingTemplateById(id!),
    enabled: !!id,
  });
};

/**
 * Hook to fetch all trading templates including inactive (Admin only)
 */
export const useAllTradingTemplatesQuery = () => {
  return useQuery({
    queryKey: queryKeys.tradingTemplates.allList(), // custom key
    queryFn: () => tradingTemplateService.getAllTradingTemplates(),
  });
};

// =====================
// MUTATIONS
// =====================

/**
 * Hook to release a backtest process as a trading template
 */
export const useReleaseTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      processId,
      data,
    }: {
      processId: string;
      data: ReleaseTemplateInput;
    }) => tradingTemplateService.releaseTradingTemplate(processId, data),
    onSuccess: () => {
      // Invalidate template lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingTemplates.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingTemplates.allList(),
      });
    },
  });
};

/**
 * Hook to toggle template active status
 */
export const useToggleTemplateActiveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ToggleActiveInput }) =>
      tradingTemplateService.toggleTradingTemplateActive(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingTemplates.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingTemplates.allList(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingTemplates.detail(id),
      });
    },
  });
};

/**
 * Hook to delete a trading template
 */
export const useDeleteTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      tradingTemplateService.deleteTradingTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingTemplates.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingTemplates.allList(),
      });
    },
  });
};

/**
 * Hook to update a trading template
 */
export const useUpdateTradingTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TradingTemplateUpdate }) =>
      tradingTemplateService.updateTradingTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingTemplates.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingTemplates.allList(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingTemplates.detail(id),
      });
    },
  });
};

/**
 * Hook to rerun backtest for a specific period
 */
export const useRerunBacktestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      period,
    }: {
      id: string;
      period: "7d" | "30d" | "90d";
    }) => tradingTemplateService.rerunBacktest(id, period),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingTemplates.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingTemplates.list(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingTemplates.allList(),
      });
    },
  });
};
