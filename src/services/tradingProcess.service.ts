import apiClient from './apiClient';
import type { 
  TradingProcess, 
  TradingProcessCreate, 
  TradingProcessUpdate,
  TradingProcessPaginatedResponse,
  TradingStatusType,
  TradingDetailsResponse,
  TradingPerformanceResponse,
  NotificationSetupRequest,
  NotificationStatusResponse
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

export const getTradingDetails = async (
  processId: string, 
  page: number = 1, 
  pageSize: number = 50
): Promise<TradingDetailsResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('page_size', pageSize.toString());

  const response = await apiClient.get(`api/v1/trading-processes/${processId}/trading-details?${params.toString()}`);
  return response.data;
};

export const getTradingPerformance = async (processId: string): Promise<TradingPerformanceResponse> => {
  const response = await apiClient.get(`api/v1/trading-processes/${processId}/performance`);
  return response.data;
};

// Notification API calls

export const getNotificationStatus = async (processId: string): Promise<NotificationStatusResponse> => {
  const response = await apiClient.get(`api/v1/notifications/noti-setup/${processId}`);
  return response.data;
};

export const updateNotificationStatus = async (data: NotificationSetupRequest): Promise<NotificationStatusResponse> => {
  const response = await apiClient.post(`api/v1/notifications/noti-setup`, data);
  return response.data;
};
