import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create a client with optimal defaults for this app
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 2 minutes - no refetch if within this window
      staleTime: 2 * 60 * 1000,
      // Keep unused data in cache for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Don't refetch on window focus - can be enabled per query
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

// Query keys factory for type safety and consistency
export const queryKeys = {
  // Trading Accounts
  tradingAccounts: {
    all: ["tradingAccounts"] as const,
    lists: () => [...queryKeys.tradingAccounts.all, "list"] as const,
    list: (filters: { page?: number; pageSize?: number; exchange?: string }) =>
      [...queryKeys.tradingAccounts.lists(), filters] as const,
    active: (exchange?: string) =>
      [...queryKeys.tradingAccounts.all, "active", exchange] as const,
    details: () => [...queryKeys.tradingAccounts.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.tradingAccounts.details(), id] as const,
    summary: (id: string) =>
      [...queryKeys.tradingAccounts.detail(id), "summary"] as const,
    positions: (id: string) =>
      [...queryKeys.tradingAccounts.detail(id), "positions"] as const,
    spotBalance: (id: string) =>
      [...queryKeys.tradingAccounts.detail(id), "spotBalance"] as const,
    orders: (id: string, symbol?: string) =>
      [...queryKeys.tradingAccounts.detail(id), "orders", symbol] as const,
  },

  // Bot Templates
  botTemplates: {
    all: ["botTemplates"] as const,
    lists: () => [...queryKeys.botTemplates.all, "list"] as const,
    list: (filters: { keyword?: string; skip?: number; limit?: number }) =>
      [...queryKeys.botTemplates.lists(), filters] as const,
    active: () => [...queryKeys.botTemplates.all, "active"] as const,
    details: () => [...queryKeys.botTemplates.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.botTemplates.details(), id] as const,
  },

  // Trading Processes
  tradingProcesses: {
    all: ["tradingProcesses"] as const,
    lists: () => [...queryKeys.tradingProcesses.all, "list"] as const,
    list: (filters: { status?: string; skip?: number; limit?: number }) =>
      [...queryKeys.tradingProcesses.lists(), filters] as const,
    running: () => [...queryKeys.tradingProcesses.all, "running"] as const,
    details: () => [...queryKeys.tradingProcesses.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.tradingProcesses.details(), id] as const,
  },

  // Modules
  modules: {
    all: ["modules"] as const,
    lists: () => [...queryKeys.modules.all, "list"] as const,
    list: (filters: { keyword?: string; skip?: number; limit?: number }) =>
      [...queryKeys.modules.lists(), filters] as const,
    details: () => [...queryKeys.modules.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.modules.details(), id] as const,
  },

  // Backtest Processes
  backtests: {
    all: ["backtests"] as const,
    lists: () => [...queryKeys.backtests.all, "list"] as const,
    list: (filters: { status?: string; skip?: number; limit?: number }) =>
      [...queryKeys.backtests.lists(), filters] as const,
    byTemplate: (templateId: string, status?: string) =>
      [...queryKeys.backtests.all, "byTemplate", templateId, status] as const,
    details: () => [...queryKeys.backtests.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.backtests.details(), id] as const,
  },

  // Backtest Results
  backtestResults: {
    all: ["backtestResults"] as const,
    byProcess: (processId: string) =>
      [...queryKeys.backtestResults.all, "byProcess", processId] as const,
    details: () => [...queryKeys.backtestResults.all, "detail"] as const,
    detail: (resultId: string) =>
      [...queryKeys.backtestResults.details(), resultId] as const,
  },

  // Bot Optimization
  botOptimization: {
    all: ["botOptimization"] as const,
    models: (provider: string) =>
      [...queryKeys.botOptimization.all, "models", provider] as const,
    defaultPrompt: () =>
      [...queryKeys.botOptimization.all, "defaultPrompt"] as const,
  },

  // Chart Data
  chart: {
    all: ["chart"] as const,
    candles: (symbol: string, interval: string, start: number, end: number) =>
      [
        ...queryKeys.chart.all,
        "candles",
        symbol,
        interval,
        start,
        end,
      ] as const,
    symbols: () => [...queryKeys.chart.all, "symbols"] as const,
    price: (symbol: string) =>
      [...queryKeys.chart.all, "price", symbol] as const,
  },
} as const;

// Export provider components for use in main.tsx
export { QueryClientProvider, ReactQueryDevtools };
