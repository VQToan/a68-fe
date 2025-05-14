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

export interface BacktestMetrics {
  // Trade Statistics
  total_trades: number;
  monthly_trades: number;
  long_trades: number;
  short_trades: number;
  
  // Win/Loss Ratios
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  long_win_rate: number;
  short_win_rate: number;
  
  // PnL Metrics
  total_pnl: number;
  monthly_pnl: number;
  avg_pnl_per_trade: number;
  avg_long_pnl: number;
  avg_short_pnl: number;
  
  // ROI Metrics
  total_roi: number;
  monthly_roi: number;
  avg_roi_per_trade: number;
  avg_long_roi: number;
  avg_short_roi: number;
  
  // Risk Metrics
  max_loss_occurrences: number;
  mdd: number;
  sharpe_ratio: number;
  profit_factor: number;
}

export interface BacktestResultItem {
  result_id: string;
  trades: BacktestTrade[];
  metrics: BacktestMetrics;
  created_at: string;
}

export interface BacktestResult {
  _id: string;
  process_id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  created_at: string;
  results: BacktestResultItem[];
}

// Get all backtest processes with optional status filter
export const getBacktestProcesses = async (
  status?: string,
  skip?: number,
  limit?: number
): Promise<BacktestProcess[]> => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (skip !== undefined) params.append("skip", skip.toString());
  if (limit !== undefined) params.append("limit", limit.toString());

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await apiClient.get(`${API_BASE_PATH}${queryString}`);
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

/**
 * Get detailed backtest results for a specific process
 */
export const getBacktestResult = async (
  processId: string
): Promise<BacktestResult> => {
  const response = await apiClient.get(`${API_BASE_PATH}/${processId}/results`);
  return response.data;
};
