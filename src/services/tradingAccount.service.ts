import apiClient from './apiClient';
import type { 
  TradingAccount, 
  TradingAccountCreate, 
  TradingAccountUpdate,
  TradingAccountPaginatedResponse,
  TradingExchangeType,
  DashboardData,
  AccountBalance,
  PositionSummary,
  OpenPositionRequest,
  ClosePositionRequest,
  ClosePartialPositionRequest,
  OrderResponse,
  ClosePositionResponse,
  ClosePartialPositionResponse
} from '@/types/trading.types';

// Trading Account API calls

export const getAll = async (
  page: number = 1,
  page_size: number = 20,
  exchange?: TradingExchangeType
): Promise<TradingAccountPaginatedResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('page_size', page_size.toString());
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

export const getActiveAccounts = async (exchange?: TradingExchangeType): Promise<TradingAccount[]> => {
  // Get all active trading accounts using the main endpoint
  const params = new URLSearchParams();
  params.append('page', '1');
  params.append('page_size', '100'); // Get all accounts
  if (exchange) params.append('exchange', exchange);

  const response = await apiClient.get(`api/v1/trading-accounts?${params.toString()}`);
  return response.data.items || [];
};

// New dashboard and trading endpoints

export const getAccountSummary = async (accountId: string): Promise<DashboardData> => {
  const response = await apiClient.get(`api/v1/trading-accounts/${accountId}/summary`);
  return response.data;
};

export const refreshAccountData = async (accountId: string): Promise<TradingAccount> => {
  const response = await apiClient.post(`api/v1/trading-accounts/${accountId}/refresh`);
  return response.data;
};

export const getAccountBalance = async (accountId: string): Promise<AccountBalance> => {
  const response = await apiClient.get(`api/v1/trading-accounts/${accountId}/balance`);
  return response.data;
};

export const getPositions = async (accountId: string, symbol?: string): Promise<PositionSummary[]> => {
  const params = new URLSearchParams();
  if (symbol) params.append('symbol', symbol);
  
  const queryString = params.toString();
  const url = `api/v1/trading-accounts/${accountId}/positions${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiClient.get(url);
  return response.data;
};

export const openPosition = async (accountId: string, data: OpenPositionRequest): Promise<OrderResponse> => {
  const response = await apiClient.post(`api/v1/trading-accounts/${accountId}/positions/open`, data);
  return response.data;
};

export const closePosition = async (accountId: string, data: ClosePositionRequest): Promise<ClosePositionResponse> => {
  const response = await apiClient.post(`api/v1/trading-accounts/${accountId}/positions/close`, data);
  return response.data;
};

export const closePartialPosition = async (accountId: string, data: ClosePartialPositionRequest): Promise<ClosePartialPositionResponse> => {
  const response = await apiClient.post(`api/v1/trading-accounts/${accountId}/positions/close-partial`, data);
  return response.data;
};
