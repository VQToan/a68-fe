import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@config/queryClient";
import * as tradingProcessService from "@services/tradingProcess.service";
import type {
  TradingStatusType,
  TradingProcessCreate,
  TradingProcessUpdate,
  NotificationSetupRequest,
  CombineBalanceRequest,
  TradingCommandRequest,
} from "@/types/trading.types";

/**
 * Hook to fetch trading processes list with status filter and pagination
 */
export const useTradingProcessesQuery = (
  status?: TradingStatusType,
  skip: number = 0,
  limit: number = 100
) => {
  return useQuery({
    queryKey: queryKeys.tradingProcesses.list({ status, skip, limit }),
    queryFn: () => tradingProcessService.getAll(status, skip, limit),
  });
};

/**
 * Hook to fetch running trading processes
 */
export const useRunningProcessesQuery = () => {
  return useQuery({
    queryKey: queryKeys.tradingProcesses.running(),
    queryFn: () => tradingProcessService.getRunningProcesses(),
    staleTime: 30 * 1000, // Refresh more frequently for active processes
  });
};

/**
 * Hook to fetch single trading process by ID
 */
export const useTradingProcessByIdQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.tradingProcesses.detail(id!),
    queryFn: () => tradingProcessService.getById(id!),
    enabled: !!id,
  });
};

/**
 * Hook to fetch trading details for a process
 */
export const useTradingDetailsQuery = (
  processId: string | undefined,
  page: number = 1,
  pageSize: number = 50
) => {
  return useQuery({
    queryKey: [
      ...queryKeys.tradingProcesses.detail(processId!),
      "details",
      { page, pageSize },
    ],
    queryFn: () =>
      tradingProcessService.getTradingDetails(processId!, page, pageSize),
    enabled: !!processId,
  });
};

/**
 * Hook to fetch trading performance for a process
 */
export const useTradingPerformanceQuery = (processId: string | undefined) => {
  return useQuery({
    queryKey: [...queryKeys.tradingProcesses.detail(processId!), "performance"],
    queryFn: () => tradingProcessService.getTradingPerformance(processId!),
    enabled: !!processId,
  });
};

/**
 * Hook to fetch notification status for a process
 */
export const useNotificationStatusQuery = (processId: string | undefined) => {
  return useQuery({
    queryKey: [
      ...queryKeys.tradingProcesses.detail(processId!),
      "notifications",
    ],
    queryFn: () => tradingProcessService.getNotificationStatus(processId!),
    enabled: !!processId,
  });
};

/**
 * Hook to fetch combine balance status
 */
export const useCombineBalanceStatusQuery = (processId: string | undefined) => {
  return useQuery({
    queryKey: [
      ...queryKeys.tradingProcesses.detail(processId!),
      "combineBalance",
    ],
    queryFn: () => tradingProcessService.getCombineBalanceStatus(processId!),
    enabled: !!processId,
  });
};

/**
 * Hook to fetch trading state
 */
export const useTradingStateQuery = (tradingId: string | undefined) => {
  return useQuery({
    queryKey: [...queryKeys.tradingProcesses.detail(tradingId!), "state"],
    queryFn: () => tradingProcessService.getTradingState(tradingId!),
    enabled: !!tradingId,
    staleTime: 10 * 1000, // Refresh frequently for live state
  });
};

// =====================
// MUTATIONS
// =====================

/**
 * Hook to create a new trading process
 */
export const useCreateTradingProcessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TradingProcessCreate) =>
      tradingProcessService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingProcesses.all,
      });
    },
  });
};

/**
 * Hook to update a trading process
 */
export const useUpdateTradingProcessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TradingProcessUpdate }) =>
      tradingProcessService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingProcesses.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingProcesses.detail(id),
      });
    },
  });
};

/**
 * Hook to delete a trading process
 */
export const useDeleteTradingProcessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tradingProcessService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingProcesses.all,
      });
    },
  });
};

/**
 * Hook to start a trading process
 */
export const useStartTradingProcessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tradingProcessService.start(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingProcesses.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingProcesses.detail(id),
      });
    },
  });
};

/**
 * Hook to stop a trading process
 */
export const useStopTradingProcessMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      clearPositions,
    }: {
      id: string;
      clearPositions?: boolean;
    }) => tradingProcessService.stop(id, clearPositions),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingProcesses.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingProcesses.detail(id),
      });
    },
  });
};

/**
 * Hook to update notification status
 */
export const useUpdateNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NotificationSetupRequest) =>
      tradingProcessService.updateNotificationStatus(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...queryKeys.tradingProcesses.detail(data.process_id),
          "notifications",
        ],
      });
    },
  });
};

/**
 * Hook to set combine balance
 */
export const useSetCombineBalanceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      processId,
      data,
    }: {
      processId: string;
      data: CombineBalanceRequest;
    }) => tradingProcessService.setCombineBalance(processId, data),
    onSuccess: (_, { processId }) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...queryKeys.tradingProcesses.detail(processId),
          "combineBalance",
        ],
      });
    },
  });
};

/**
 * Hook to send trading command
 */
export const useSendTradingCommandMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tradingId,
      command,
    }: {
      tradingId: string;
      command: TradingCommandRequest;
    }) => tradingProcessService.sendTradingCommand(tradingId, command),
    onSuccess: (_, { tradingId }) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.tradingProcesses.detail(tradingId), "state"],
      });
    },
  });
};

/**
 * Hook to clear pending commands
 */
export const useClearPendingCommandsMutation = () => {
  return useMutation({
    mutationFn: (tradingId: string) =>
      tradingProcessService.clearPendingCommands(tradingId),
  });
};

/**
 * Hook to get query invalidation helpers
 */
export const useTradingProcessInvalidation = () => {
  const queryClient = useQueryClient();

  return {
    invalidateProcesses: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingProcesses.all,
      }),
    invalidateProcessesList: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingProcesses.lists(),
      }),
    invalidateRunningProcesses: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingProcesses.running(),
      }),
    invalidateProcessDetail: (id: string) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingProcesses.detail(id),
      }),
  };
};
