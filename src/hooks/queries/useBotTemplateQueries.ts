import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@config/queryClient";
import * as botTemplateService from "@services/botTemplate.service";
import type {
  BotTemplateCreate,
  BotTemplateUpdate,
} from "@/types/botTemplate.types";

/**
 * Hook to fetch bot templates list with search and pagination
 */
export const useBotTemplatesQuery = (
  keyword?: string,
  skip?: number,
  limit?: number
) => {
  return useQuery({
    queryKey: queryKeys.botTemplates.list({ keyword, skip, limit }),
    queryFn: () => botTemplateService.getBotTemplates(keyword, skip, limit),
  });
};

/**
 * Hook to fetch active bot templates for dropdowns/selects
 */
export const useActiveBotTemplatesQuery = () => {
  return useQuery({
    queryKey: queryKeys.botTemplates.active(),
    queryFn: () => botTemplateService.getActiveBotTemplates(),
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes (longer for dropdowns)
  });
};

/**
 * Hook to fetch single bot template by ID
 */
export const useBotTemplateByIdQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.botTemplates.detail(id!),
    queryFn: () => botTemplateService.getBotTemplateById(id!),
    enabled: !!id,
  });
};

// =====================
// MUTATIONS
// =====================

/**
 * Hook to create a new bot template
 */
export const useCreateBotTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BotTemplateCreate) =>
      botTemplateService.createBotTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.botTemplates.all });
    },
  });
};

/**
 * Hook to update a bot template
 */
export const useUpdateBotTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BotTemplateUpdate }) =>
      botTemplateService.updateBotTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.botTemplates.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.botTemplates.detail(id),
      });
    },
  });
};

/**
 * Hook to delete a bot template
 */
export const useDeleteBotTemplateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => botTemplateService.deleteBotTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.botTemplates.all });
    },
  });
};

/**
 * Hook that provides callback-style functions for compatibility with existing code
 */
export const useBotTemplate = () => {
  const {
    data: activeTemplates = [],
    isLoading: templatesLoading,
    refetch,
  } = useActiveBotTemplatesQuery();

  const getActiveTemplates = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    activeTemplates,
    getActiveTemplates,
    isLoading: templatesLoading,
    templates: activeTemplates,
  };
};

/**
 * Hook to get query invalidation helpers
 */
export const useBotTemplateInvalidation = () => {
  const queryClient = useQueryClient();

  return {
    invalidateTemplates: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.botTemplates.all,
      }),
    invalidateTemplatesList: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.botTemplates.lists(),
      }),
    invalidateActiveTemplates: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.botTemplates.active(),
      }),
    invalidateTemplateDetail: (id: string) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.botTemplates.detail(id),
      }),
  };
};
