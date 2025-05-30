import apiClient from "./apiClient";
import type { BotOptimizationRequest, BotOptimizationResponse, LLMModel } from "@/types/botOptimization.type";

const API_PATH = "/api/v1/bot-optimization";

/**
 * Optimize a bot template based on backtest results using LLM
 */
export const optimizeBot = async (
  data: BotOptimizationRequest
): Promise<BotOptimizationResponse> => {
  const response = await apiClient.post(`${API_PATH}/optimize`, data);
  return response.data;
};

/**
 * Get available models for a given LLM provider
 */
export const getAvailableModels = async (
  provider: string,
  apiKey: string
): Promise<{ provider: string, models: LLMModel[] }> => {
  const response = await apiClient.post(`${API_PATH}/models`, {
    llm_provider: provider,
    api_key: apiKey
  });
  return response.data;
};

/**
 * Get the default prompt template used for optimization
 */
export const getDefaultPrompt = async (): Promise<{ default_prompt: string }> => {
  const response = await apiClient.get(`${API_PATH}/default-prompt`);
  return response.data;
};