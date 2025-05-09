import apiClient from './apiClient';

// Backtest Process Status Type
export type BacktestStatus = 'pending' | 'running' | 'completed' | 'failed' | 'stopped';

// Backtest Process Type
export interface BacktestProcess {
  _id: string;
  name: string;
  description: string;
  user_id: string;
  parameters: Record<string, any>;
  created_at: string;
  status: BacktestStatus;
  progress: number;
  completed_at?: string | null;
  result_id?: string | null;
}

// Create Backtest Process Type
export interface BacktestProcessCreate {
  name: string;
  description: string;
  user_id: string;
  parameters?: Record<string, any>;
}

// Update Backtest Process Type
export interface BacktestProcessUpdate {
  name?: string | null;
  description?: string | null;
  parameters?: Record<string, any> | null;
}

// Backtest Process Action Type
export interface BacktestProcessAction {
  action: 'run' | 'stop';
}

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