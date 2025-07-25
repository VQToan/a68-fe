import apiClient from './apiClient';
import type { 
  TradingAccount, 
  TradingAccountCreate, 
  TradingAccountUpdate,
  TradingAccountPaginatedResponse,
  TradingExchangeType 
} from '@/types/trading.types';

// Trading Account API calls

export const getAll = async (
  page: number = 1,
  page_size: number = 20,
  is_active?: boolean,
  exchange?: TradingExchangeType
): Promise<TradingAccountPaginatedResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('page_size', page_size.toString());
  if (is_active !== undefined) params.append('is_active', is_active.toString());
  if (exchange) params.append('exchange', exchange);

  const response = await apiClient.get(`api/v1/trading-accounts?${params.toString()}`);
  return response.data;
};

export const getById = async (id: string): Promise<TradingAccount> => {
  const response = await apiClient.get(`api/v1/trading-accounts/${id}`);
  return response.data;
};

export const create = async (data: TradingAccountCreate): Promise<TradingAccount> => {
  const response = await apiClient.post('api/v1/trading-accounts', data);
  return response.data;
};

export const update = async (id: string, data: TradingAccountUpdate): Promise<TradingAccount> => {
  const response = await apiClient.put(`api/v1/trading-accounts/${id}`, data);
  return response.data;
};

export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`api/v1/trading-accounts/${id}`);
};

export const getActiveAccounts = async (): Promise<TradingAccount[]> => {
  const response = await apiClient.get('api/v1/trading-accounts/active/list');
  return response.data;
};
