import type {
  BacktestProcess,
  BacktestProcessCreate,
  BacktestProcessUpdate,
} from "@/types/backtest.type";
import apiClient from "./apiClient";

const API_BASE_PATH = "/api/v1/backtest-processes";

export interface BacktestTrade {
  time: number;
  price: number;
  reason: string;
  quantity: number;
  side: "LONG" | "SHORT";
  pnl: number;
  position_result: string;
  position_pnl: number;
}



// Response type with pagination metadata
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// Get all backtest processes with optional status filter
export const getBacktestProcesses = async (
  status?: string,
  skip?: number,
  limit?: number
): Promise<PaginatedResponse<BacktestProcess>> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (skip !== undefined) params.append("skip", skip.toString());
  if (limit !== undefined) params.append("limit", limit.toString());

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await apiClient.get(`${API_BASE_PATH}${queryString}`);
  
  // Return the paginated response
  return response.data;
};

// Get a backtest process by ID
export const getBacktestProcessById = async (
  id: string
): Promise<BacktestProcess> => {
  const response = await apiClient.get(`${API_BASE_PATH}/${id}`);
  return response.data;
};

// Create a new backtest process
export const createBacktestProcess = async (
  processData: BacktestProcessCreate
): Promise<BacktestProcess> => {
  const response = await apiClient.post(API_BASE_PATH, processData);
  return response.data;
};

// Update a backtest process
export const updateBacktestProcess = async (
  id: string,
  updates: BacktestProcessUpdate
): Promise<BacktestProcess> => {
  const response = await apiClient.put(`${API_BASE_PATH}/${id}`, updates);
  return response.data;
};

// Delete a backtest process
export const deleteBacktestProcess = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_BASE_PATH}/${id}`);
};

// Run a backtest process
export const runBacktestProcess = async (
  id: string,
  params: {
    start_date: number;
    end_date: number;
  }
): Promise<BacktestProcess> => {
  const response = await apiClient.post(`${API_BASE_PATH}/${id}/run`, params);
  return response.data;
};

// Stop a backtest process
export const stopBacktestProcess = async (
  id: string
): Promise<BacktestProcess> => {
  const response = await apiClient.post(`${API_BASE_PATH}/${id}/stop`);
  return response.data;
};
