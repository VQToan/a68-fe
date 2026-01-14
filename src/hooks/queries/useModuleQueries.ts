import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@config/queryClient";
import * as moduleBotService from "@services/moduleBots.service";
import type {
  ModuleBotCreate,
  ModuleBotUpdate,
} from "@services/moduleBots.service";

/**
 * Hook to fetch module bots list with search and pagination
 */
export const useModulesQuery = (
  keyword?: string,
  skip?: number,
  limit?: number
) => {
  return useQuery({
    queryKey: queryKeys.modules.list({ keyword, skip, limit }),
    queryFn: () => moduleBotService.getModuleBots(keyword, skip, limit),
  });
};

/**
 * Hook to fetch single module bot by ID
 */
export const useModuleByIdQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.modules.detail(id!),
    queryFn: () => moduleBotService.getModuleBotById(id!),
    enabled: !!id,
  });
};

/**
 * Hook to fetch module bot by source name
 */
export const useModuleBySourceNameQuery = (
  nameInSource: string | undefined
) => {
  return useQuery({
    queryKey: [...queryKeys.modules.all, "bySourceName", nameInSource] as const,
    queryFn: () => moduleBotService.getModuleBotBySourceName(nameInSource!),
    enabled: !!nameInSource,
  });
};

// =====================
// MUTATIONS
// =====================

/**
 * Hook to create a new module bot
 */
export const useCreateModuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ModuleBotCreate) =>
      moduleBotService.createModuleBot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.modules.all });
    },
  });
};

/**
 * Hook to update a module bot
 */
export const useUpdateModuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModuleBotUpdate }) =>
      moduleBotService.updateModuleBot(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.modules.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.modules.detail(id) });
    },
  });
};

/**
 * Hook to delete a module bot
 */
export const useDeleteModuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => moduleBotService.deleteModuleBot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.modules.all });
    },
  });
};

/**
 * Hook to get query invalidation helpers
 */
export const useModuleInvalidation = () => {
  const queryClient = useQueryClient();

  return {
    invalidateModules: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.modules.all,
      }),
    invalidateModulesList: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.modules.lists(),
      }),
    invalidateModuleDetail: (id: string) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.modules.detail(id),
      }),
  };
};
