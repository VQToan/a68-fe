import type { BacktestProcess, BacktestProcessCreate, BacktestProcessUpdate } from '@/types/backtest.type';
import apiClient from './apiClient';

const API_BASE_PATH = '/api/v1/backtest-processes';

// Get all backtest processes with optional status filter
export const getBacktestProcesses = async (
  status?: string, 
  skip?: number, 
  limit?: number
): Promise<BacktestProcess[]> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (skip !== undefined) params.append('skip', skip.toString());
  if (limit !== undefined) params.append('limit', limit.toString());
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get(`${API_BASE_PATH}${queryString}`);
  return response.data;
};

// Get a backtest process by ID
export const getBacktestProcessById = async (id: string): Promise<BacktestProcess> => {
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

// Perform an action on a backtest process (run or stop)
export const performBacktestAction = async (
  id: string,
  action: 'run' | 'stop'
): Promise<BacktestProcess> => {
  const response = await apiClient.post(`${API_BASE_PATH}/${id}/action`, { action });
  return response.data;
};