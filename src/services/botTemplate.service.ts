import api from './apiClient';
import type { BotTemplate, BotTemplateCreate, BotTemplateUpdate } from '../types/botTemplate.types';

// Get all bot templates with optional search and pagination
export const getBotTemplates = async (
  keyword?: string,
  skip?: number, 
  limit?: number
): Promise<BotTemplate[]> => {
  try {
    const params: Record<string, any> = {};
    
    if (keyword) params.keyword = keyword;
    if (skip !== undefined) params.skip = skip;
    if (limit !== undefined) params.limit = limit;

    const response = await api.get('/api/v1/bot-templates/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching bot templates:', error);
    throw error;
  }
};

// Get a single bot template by ID
export const getBotTemplateById = async (id: string): Promise<BotTemplate> => {
  try {
    const response = await api.get(`/api/v1/bot-templates/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bot template with ID ${id}:`, error);
    throw error;
  }
};

// Create a new bot template
export const createBotTemplate = async (
  templateData: BotTemplateCreate
): Promise<BotTemplate> => {
  try {
    const response = await api.post('/api/v1/bot-templates/', templateData);
    return response.data;
  } catch (error) {
    console.error('Error creating bot template:', error);
    throw error;
  }
};

// Update an existing bot template
export const updateBotTemplate = async (
  id: string,
  updates: BotTemplateUpdate
): Promise<BotTemplate> => {
  try {
    const response = await api.put(`/api/v1/bot-templates/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating bot template with ID ${id}:`, error);
    throw error;
  }
};

// Delete a bot template
export const deleteBotTemplate = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/v1/bot-templates/${id}`);
  } catch (error) {
    console.error(`Error deleting bot template with ID ${id}:`, error);
    throw error;
  }
};