import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { 
  optimizeBot as optimizeBotAction, 
  clearResults as clearResultsAction,
  fetchAvailableModels as fetchAvailableModelsAction,
  clearModels as clearModelsAction
} from "@/features/botOptimization/botOptimizationSlice";
import type { BotOptimizationRequest } from "@/types/botOptimization.type";

export const useBotOptimization = () => {
  const dispatch = useAppDispatch();
  
  // Select data from the Redux store
  const optimizationResults = useAppSelector((state) => state.botOptimization.optimizationResults);
  const isLoading = useAppSelector((state) => state.botOptimization.isLoading);
  const error = useAppSelector((state) => state.botOptimization.error);
  const availableModels = useAppSelector((state) => state.botOptimization.availableModels);
  const isLoadingModels = useAppSelector((state) => state.botOptimization.isLoadingModels);

  // Function to optimize a bot
  const optimizeBot = useCallback((requestData: BotOptimizationRequest) => {
    return dispatch(optimizeBotAction(requestData));
  }, [dispatch]);

  // Function to fetch available models for a provider
  const fetchAvailableModels = useCallback((provider: string, apiKey: string) => {
    return dispatch(fetchAvailableModelsAction({ provider, apiKey }));
  }, [dispatch]);

  // Function to clear optimization results
  const clearResults = useCallback(() => {
    dispatch(clearResultsAction());
  }, [dispatch]);

  // Function to clear available models
  const clearModels = useCallback(() => {
    dispatch(clearModelsAction());
  }, [dispatch]);

  return {
    optimizationResults,
    isLoading,
    error,
    availableModels,
    isLoadingModels,
    optimizeBot,
    fetchAvailableModels,
    clearResults,
    clearModels
  };
};