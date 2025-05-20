import type { 
  BacktestResultDetail, 
  BacktestResultSummary, 
  DeleteBacktestResultResponse 
} from "@/types/backtestResult.type";
import apiClient from "./apiClient";

const API_BASE_PATH = "/api/v1/backtest-results";

/**
 * Get list of backtest results by process ID
 * @param processId The ID of the backtest process
 * @returns Array of backtest result summaries
 */
export const getBacktestResultsByProcessId = async (
  processId: string
): Promise<BacktestResultSummary[]> => {
  const response = await apiClient.get(`${API_BASE_PATH}/${processId}`);
  return response.data;
};

/**
 * Get detailed backtest result by result ID
 * @param resultId The ID of the backtest result
 * @returns Detailed backtest result with trades
 */
export const getBacktestResultDetail = async (
  resultId: string
): Promise<BacktestResultDetail> => {
  const response = await apiClient.get(`${API_BASE_PATH}/detail/${resultId}`);
  return response.data;
};

/**
 * Delete a backtest result
 * @param resultId The ID of the backtest result to delete
 * @returns Success message
 */
export const deleteBacktestResult = async (
  resultId: string
): Promise<DeleteBacktestResultResponse> => {
  const response = await apiClient.delete(`${API_BASE_PATH}/${resultId}`);
  return response.data;
};