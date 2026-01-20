import apiClient from "./apiClient";
import type {
  ReleaseTemplateInput,
  ToggleActiveInput,
  TradingTemplate,
  TradingTemplateListItem,
  TradingTemplateUpdate,
} from "@/types/tradingTemplate.type";

const API_BASE_PATH = "/api/v1/trading-templates";

// List all active templates (Public)
export const getTradingTemplates = async (): Promise<
  TradingTemplateListItem[]
> => {
  const response = await apiClient.get(`${API_BASE_PATH}/`);
  return response.data;
};

// Get template details (Public)
export const getTradingTemplateById = async (
  id: string,
): Promise<TradingTemplate> => {
  const response = await apiClient.get(`${API_BASE_PATH}/${id}`);
  return response.data;
};

// Release from backtest (Admin only)
export const releaseTradingTemplate = async (
  processId: string,
  data: ReleaseTemplateInput,
): Promise<TradingTemplate> => {
  const response = await apiClient.post(
    `${API_BASE_PATH}/release/${processId}`,
    data,
  );
  return response.data;
};

// List all templates including inactive (Admin only)
export const getAllTradingTemplates = async (): Promise<
  TradingTemplateListItem[]
> => {
  const response = await apiClient.get(`${API_BASE_PATH}/all`);
  return response.data;
};

// Toggle active status (Admin only)
export const toggleTradingTemplateActive = async (
  id: string,
  data: ToggleActiveInput,
): Promise<TradingTemplate> => {
  const response = await apiClient.patch(`${API_BASE_PATH}/${id}/toggle`, data);
  return response.data;
};

// Update template details (Admin only)
export const updateTradingTemplate = async (
  id: string,
  data: TradingTemplateUpdate,
): Promise<TradingTemplate> => {
  const response = await apiClient.put(`${API_BASE_PATH}/${id}`, data);
  return response.data;
};

// Delete template (Admin only)
export const deleteTradingTemplate = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_BASE_PATH}/${id}`);
};
