import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@config/queryClient";
import * as chartService from "@services/chart.service";

/**
 * Hook to fetch candlestick data for a symbol
 */
export const useCandlesQuery = (
  symbol: string | undefined,
  interval: string,
  startTime: number,
  endTime: number,
  enabled: boolean = true
) => {
  // Format symbol if needed
  const formattedSymbol = symbol
    ? symbol.toUpperCase().includes("USDT")
      ? symbol.toUpperCase()
      : `${symbol.toUpperCase()}USDT`
    : "";

  return useQuery({
    queryKey: queryKeys.chart.candles(
      formattedSymbol,
      interval,
      startTime,
      endTime
    ),
    queryFn: async () => {
      const response = await chartService.getCandles(
        formattedSymbol,
        interval,
        startTime,
        endTime
      );
      return response.data;
    },
    enabled: !!symbol && enabled,
    staleTime: 60 * 1000, // 1 minute - chart data can be stale quickly
  });
};

/**
 * Hook to fetch available symbols
 */
export const useSymbolsQuery = () => {
  return useQuery({
    queryKey: queryKeys.chart.symbols(),
    queryFn: async () => {
      const response = await chartService.getAvailableSymbols();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - symbols don't change often
  });
};

/**
 * Hook to fetch latest price for a symbol
 */
export const usePriceQuery = (symbol: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.chart.price(symbol!),
    queryFn: async () => {
      const response = await chartService.getLatestPrice(symbol!);
      return response.data;
    },
    enabled: !!symbol,
    staleTime: 5 * 1000, // 5 seconds - price changes frequently
    refetchInterval: 10 * 1000, // Auto-refresh every 10 seconds
  });
};

/**
 * Hook that provides a fetchCandles callback for compatibility with existing code
 * This is useful when you need to fetch candles imperatively (e.g., in useEffect)
 */
export const useChart = () => {
  const [error, setError] = useState<string | null>(null);

  const fetchCandles = useCallback(
    async (
      symbol: string,
      interval: string,
      startTime: number,
      endTime: number
    ) => {
      try {
        setError(null);
        const response = await chartService.getCandles(
          symbol,
          interval,
          startTime,
          endTime
        );
        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch candles";
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  return { fetchCandles, error };
};
