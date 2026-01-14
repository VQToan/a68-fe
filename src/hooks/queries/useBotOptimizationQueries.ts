import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@config/queryClient";
import * as botOptimizationService from "@services/botOptimization.service";
import type {
  BotOptimizationRequest,
  LLMModel,
} from "@/types/botOptimization.type";

/**
 * Hook to fetch available models for a provider
 */
export const useAvailableModelsQuery = (
  provider: string | undefined,
  apiKey: string | undefined
) => {
  return useQuery({
    queryKey: queryKeys.botOptimization.models(provider!),
    queryFn: () =>
      botOptimizationService.getAvailableModels(provider!, apiKey!),
    enabled: !!provider && !!apiKey && apiKey.length >= 20,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch default optimization prompt
 */
export const useDefaultPromptQuery = (enabled: boolean = false) => {
  return useQuery({
    queryKey: queryKeys.botOptimization.defaultPrompt(),
    queryFn: () => botOptimizationService.getDefaultPrompt(),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to optimize a bot template
 */
export const useOptimizeBotMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BotOptimizationRequest) =>
      botOptimizationService.optimizeBot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.botOptimization.all,
      });
    },
  });
};

/**
 * Hook that provides callback-style functions for compatibility with existing code
 * This maintains API compatibility with the old Redux-based useBotOptimization hook
 */
export const useBotOptimization = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<LLMModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [defaultPrompt, setDefaultPrompt] = useState<string | null>(null);
  const [isLoadingDefaultPrompt, setIsLoadingDefaultPrompt] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<any | null>(
    null
  );

  const optimizeBot = useCallback(async (data: BotOptimizationRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await botOptimizationService.optimizeBot(data);
      setOptimizationResults(result);
      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Optimization failed";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const fetchAvailableModels = useCallback(
    async (provider: string, apiKey: string) => {
      setIsLoadingModels(true);
      try {
        const result = await botOptimizationService.getAvailableModels(
          provider,
          apiKey
        );
        setAvailableModels(result.models);
        setIsLoadingModels(false);
        return result;
      } catch (err) {
        setIsLoadingModels(false);
        throw err;
      }
    },
    []
  );

  const clearModels = useCallback(() => {
    setAvailableModels([]);
  }, []);

  const clearResults = useCallback(() => {
    setOptimizationResults(null);
  }, []);

  const fetchDefaultPrompt = useCallback(async () => {
    setIsLoadingDefaultPrompt(true);
    try {
      const result = await botOptimizationService.getDefaultPrompt();
      setDefaultPrompt(result.default_prompt);
      setIsLoadingDefaultPrompt(false);
      return result;
    } catch (err) {
      setIsLoadingDefaultPrompt(false);
      throw err;
    }
  }, []);

  return {
    optimizeBot,
    isLoading,
    error,
    availableModels,
    isLoadingModels,
    fetchAvailableModels,
    clearModels,
    defaultPrompt,
    isLoadingDefaultPrompt,
    fetchDefaultPrompt,
    optimizationResults,
    clearResults,
  };
};
