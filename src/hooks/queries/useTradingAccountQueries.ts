import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@config/queryClient";
import * as tradingAccountService from "@services/tradingAccount.service";
import type {
  TradingExchangeType,
  TradingAccountCreate,
  TradingAccountUpdate,
  OpenPositionRequest,
  ClosePositionRequest,
  ClosePartialPositionRequest,
  TakeProfitRequest,
  StopLossRequest,
} from "@/types/trading.types";

/**
 * Hook to fetch paginated trading accounts list
 */
export const useTradingAccountsQuery = (
  page: number = 1,
  pageSize: number = 20,
  exchange?: TradingExchangeType
) => {
  return useQuery({
    queryKey: queryKeys.tradingAccounts.list({ page, pageSize, exchange }),
    queryFn: () => tradingAccountService.getAll(page, pageSize, exchange),
  });
};

/**
 * Hook to fetch active trading accounts for dropdowns/selects
 */
export const useActiveAccountsQuery = (exchange?: TradingExchangeType) => {
  return useQuery({
    queryKey: queryKeys.tradingAccounts.active(exchange),
    queryFn: () => tradingAccountService.getActiveAccounts(exchange),
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes (longer for dropdowns)
  });
};

/**
 * Hook to fetch single trading account by ID
 */
export const useTradingAccountByIdQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.tradingAccounts.detail(id!),
    queryFn: () => tradingAccountService.getById(id!),
    enabled: !!id,
  });
};

/**
 * Hook to fetch account summary/dashboard data
 */
export const useAccountSummaryQuery = (accountId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.tradingAccounts.summary(accountId!),
    queryFn: () => tradingAccountService.getAccountSummary(accountId!),
    enabled: !!accountId,
  });
};

/**
 * Hook to fetch account positions
 */
export const useAccountPositionsQuery = (
  accountId: string | undefined,
  symbol?: string
) => {
  return useQuery({
    queryKey: queryKeys.tradingAccounts.positions(accountId!),
    queryFn: () => tradingAccountService.getPositions(accountId!, symbol),
    enabled: !!accountId,
    staleTime: 30 * 1000, // Positions should refresh more frequently
  });
};

/**
 * Hook to fetch spot balance
 */
export const useSpotBalanceQuery = (accountId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.tradingAccounts.spotBalance(accountId!),
    queryFn: () => tradingAccountService.getSpotBalance(accountId!),
    enabled: !!accountId,
  });
};

/**
 * Hook to fetch open orders
 */
export const useOpenOrdersQuery = (
  accountId: string | undefined,
  symbol?: string
) => {
  return useQuery({
    queryKey: queryKeys.tradingAccounts.orders(accountId!, symbol),
    queryFn: () => tradingAccountService.getOpenOrders(accountId!, symbol),
    enabled: !!accountId,
    staleTime: 30 * 1000, // Orders should refresh frequently
  });
};

// =====================
// MUTATIONS
// =====================

/**
 * Hook to create a new trading account
 */
export const useCreateTradingAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TradingAccountCreate) =>
      tradingAccountService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.all,
      });
    },
  });
};

/**
 * Hook to update a trading account
 */
export const useUpdateTradingAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TradingAccountUpdate }) =>
      tradingAccountService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.detail(id),
      });
    },
  });
};

/**
 * Hook to delete a trading account
 */
export const useDeleteTradingAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tradingAccountService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.all,
      });
    },
  });
};

/**
 * Hook to refresh account data
 */
export const useRefreshAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) =>
      tradingAccountService.refreshAccountData(accountId),
    onSuccess: (_, accountId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.detail(accountId),
      });
    },
  });
};

/**
 * Hook to open a position
 */
export const useOpenPositionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      data,
    }: {
      accountId: string;
      data: OpenPositionRequest;
    }) => tradingAccountService.openPosition(accountId, data),
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.positions(accountId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.summary(accountId),
      });
    },
  });
};

/**
 * Hook to close a position
 */
export const useClosePositionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      data,
    }: {
      accountId: string;
      data: ClosePositionRequest;
    }) => tradingAccountService.closePosition(accountId, data),
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.positions(accountId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.summary(accountId),
      });
    },
  });
};

/**
 * Hook to close partial position
 */
export const useClosePartialPositionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      data,
    }: {
      accountId: string;
      data: ClosePartialPositionRequest;
    }) => tradingAccountService.closePartialPosition(accountId, data),
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.positions(accountId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.summary(accountId),
      });
    },
  });
};

/**
 * Hook to place take profit order
 */
export const usePlaceTakeProfitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      data,
    }: {
      accountId: string;
      data: TakeProfitRequest;
    }) => tradingAccountService.placeTakeProfit(accountId, data),
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.orders(accountId),
      });
    },
  });
};

/**
 * Hook to place stop loss order
 */
export const usePlaceStopLossMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      data,
    }: {
      accountId: string;
      data: StopLossRequest;
    }) => tradingAccountService.placeStopLoss(accountId, data),
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.orders(accountId),
      });
    },
  });
};

/**
 * Hook to cancel an order
 */
export const useCancelOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      orderId,
      symbol,
    }: {
      accountId: string;
      orderId: number;
      symbol: string;
    }) => tradingAccountService.cancelOrder(accountId, orderId, symbol),
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.orders(accountId),
      });
    },
  });
};

/**
 * Hook to cancel all orders
 */
export const useCancelAllOrdersMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      symbol,
    }: {
      accountId: string;
      symbol: string;
    }) => tradingAccountService.cancelAllOrders(accountId, symbol),
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.orders(accountId),
      });
    },
  });
};

/**
 * Hook to get query invalidation helpers
 */
export const useTradingAccountInvalidation = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAccounts: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.all,
      }),
    invalidateAccountsList: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.lists(),
      }),
    invalidateActiveAccounts: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.all,
        predicate: (query) => query.queryKey.includes("active"),
      }),
    invalidateAccountDetail: (id: string) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.tradingAccounts.detail(id),
      }),
  };
};
