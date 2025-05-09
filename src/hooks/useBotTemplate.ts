import { useAppSelector, useAppDispatch } from './reduxHooks';
import {
  fetchBotTemplates,
  fetchBotTemplateById,
  createBotTemplate,
  updateBotTemplate,
  deleteBotTemplate,
  clearCurrentTemplate as clearCurrentTemplateAction,
  clearError as clearErrorAction
} from '@features/botTemplate/botTemplateSlice';
import type { BotTemplateCreate, BotTemplateUpdate } from '../types/botTemplate.types';

export const useBotTemplate = () => {
  const dispatch = useAppDispatch();
  const botTemplateState = useAppSelector((state) => state.botTemplate);

  // Get all bot templates (with optional search and pagination)
  const handleGetTemplates = (keyword?: string, skip?: number, limit?: number) => {
    return dispatch(fetchBotTemplates({ keyword, skip, limit }));
  };

  // Get bot template by ID
  const handleGetTemplateById = (id: string) => {
    return dispatch(fetchBotTemplateById(id));
  };

  // Create a new bot template
  const handleCreateTemplate = (templateData: BotTemplateCreate) => {
    return dispatch(createBotTemplate(templateData));
  };

  // Update a bot template
  const handleUpdateTemplate = (id: string, updates: BotTemplateUpdate) => {
    return dispatch(updateBotTemplate({ id, updates }));
  };

  // Delete a bot template
  const handleDeleteTemplate = (id: string) => {
    return dispatch(deleteBotTemplate(id));
  };

  // Clear current template
  const handleClearCurrentTemplate = () => {
    dispatch(clearCurrentTemplateAction());
  };

  // Clear error
  const handleClearError = () => {
    dispatch(clearErrorAction());
  };

  return {
    ...botTemplateState,
    getTemplates: handleGetTemplates,
    getTemplateById: handleGetTemplateById,
    createTemplate: handleCreateTemplate,
    updateTemplate: handleUpdateTemplate,
    deleteTemplate: handleDeleteTemplate,
    clearCurrentTemplate: handleClearCurrentTemplate,
    clearError: handleClearError,
  };
};