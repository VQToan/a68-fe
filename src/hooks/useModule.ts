import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './reduxHooks';
import { 
  fetchModules,
  fetchModuleById,
  fetchModuleBySourceName,
  createModule,
  updateModule,
  deleteModule,
  clearCurrentModule as clearCurrentModuleAction,
  clearError as clearErrorAction
} from '@features/module/moduleSlice';
import type { ModuleBotCreate, ModuleBotUpdate } from '@services/moduleBots.service';

// Custom hook for debouncing values
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useModule = () => {
  const dispatch = useAppDispatch();
  const moduleState = useAppSelector((state) => state.module);

  // Get all module bots (with optional search)
  const handleGetModules = (keyword?: string, skip?: number, limit?: number) => {
    return dispatch(fetchModules({ keyword, skip, limit }));
  };

  // Get module bot by ID
  const handleGetModuleById = (id: string) => {
    return dispatch(fetchModuleById(id));
  };

  // Get module bot by source name
  const handleGetModuleBySourceName = (nameInSource: string) => {
    return dispatch(fetchModuleBySourceName(nameInSource));
  };

  // Create a new module bot
  const handleCreateModule = (moduleData: ModuleBotCreate) => {
    return dispatch(createModule(moduleData));
  };

  // Update a module bot
  const handleUpdateModule = (id: string, updates: ModuleBotUpdate) => {
    return dispatch(updateModule({ id, updates }));
  };

  // Delete a module bot
  const handleDeleteModule = (id: string) => {
    return dispatch(deleteModule(id));
  };

  // Clear current module
  const handleClearCurrentModule = () => {
    dispatch(clearCurrentModuleAction());
  };

  // Clear error
  const handleClearError = () => {
    dispatch(clearErrorAction());
  };

  return {
    ...moduleState,
    getModules: handleGetModules,
    getModuleById: handleGetModuleById,
    getModuleBySourceName: handleGetModuleBySourceName,
    createModule: handleCreateModule,
    updateModule: handleUpdateModule,
    deleteModule: handleDeleteModule,
    clearCurrentModule: handleClearCurrentModule,
    clearError: handleClearError,
  };
};