import api from './apiClient';
import type { AxiosResponse } from 'axios';

// Module Bot types based on OpenAPI spec
export type ModuleBotType = 'entry' | 'exit' | 'dca_cutloss' | 'entry_hedge' | 'after_hedge' | 'stop_loss';

export interface IModuleBot {
  _id: string;
  name: string;
  name_in_source: string;
  description: string;
  type: ModuleBotType;
  created_at: string;
}

export interface ModuleBotCreate {
  name: string;
  name_in_source: string;
  description: string;
  type: ModuleBotType;
}

export interface ModuleBotUpdate {
  name?: string | null;
  name_in_source?: string | null;
  description?: string | null;
  type?: ModuleBotType | null;
}

// Get all module bots (with optional search)
export const getModuleBots = async (
  keyword?: string,
  skip: number = 0,
  limit: number = 100
): Promise<IModuleBot[]> => {
  const params: Record<string, string | number> = { skip, limit };
  if (keyword) {
    params.keyword = keyword;
  }
  
  const response: AxiosResponse<IModuleBot[]> = await api.get('/api/v1/module-bots/', { params });
  return response.data;
};

// Create a new module bot
export const createModuleBot = async (moduleBot: ModuleBotCreate): Promise<IModuleBot> => {
  const response: AxiosResponse<IModuleBot> = await api.post('/api/v1/module-bots/', moduleBot);
  return response.data;
};

// Get a specific module bot by ID
export const getModuleBotById = async (id: string): Promise<IModuleBot> => {
  const response: AxiosResponse<IModuleBot> = await api.get(`/api/v1/module-bots/${id}`);
  return response.data;
};

// Get a specific module bot by source name
export const getModuleBotBySourceName = async (nameInSource: string): Promise<IModuleBot> => {
  const response: AxiosResponse<IModuleBot> = await api.get(`/api/v1/module-bots/by-source-name/${nameInSource}`);
  return response.data;
};

// Update a module bot
export const updateModuleBot = async (id: string, updates: ModuleBotUpdate): Promise<IModuleBot> => {
  const response: AxiosResponse<IModuleBot> = await api.put(`/api/v1/module-bots/${id}`, updates);
  return response.data;
};

// Delete a module bot
export const deleteModuleBot = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/module-bots/${id}`);
};