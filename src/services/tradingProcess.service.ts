import apiClient from './apiClient';
import type { 
  TradingProcess, 
  TradingProcessCreate, 
  TradingProcessUpdate,
  TradingProcessPaginatedResponse,
  TradingStatusType 
} from '@/types/trading.types';

// Trading Process API calls

export const getAll = async (
  status?: TradingStatusType,
  skip: number = 0,
  limit: number = 100
): Promise<TradingProcessPaginatedResponse> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());

  const response = await apiClient.get(`api/v1/trading-processes?${params.toString()}`);
  return response.data;
};

export const getById = async (id: string): Promise<TradingProcess> => {
  const response = await apiClient.get(`api/v1/trading-processes/${id}`);
  return response.data;
};

export const create = async (data: TradingProcessCreate): Promise<TradingProcess> => {
  const response = await apiClient.post(`api/v1/trading-processes`, data);
  return response.data;
};

export const update = async (id: string, data: TradingProcessUpdate): Promise<TradingProcess> => {
  const response = await apiClient.put(`api/v1/trading-processes/${id}`, data);
  return response.data;
};

export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`api/v1/trading-processes/${id}`);
};

export const start = async (id: string): Promise<TradingProcess> => {
  const response = await apiClient.post(`api/v1/trading-processes/${id}/start`);
  return response.data;
};

export const stop = async (id: string): Promise<TradingProcess> => {
  const response = await apiClient.post(`api/v1/trading-processes/${id}/stop`);
  return response.data;
};

export const getRunningProcesses = async (): Promise<TradingProcess[]> => {
  const response = await apiClient.get(`api/v1/trading-processes/active/list`);
  return response.data;
};
