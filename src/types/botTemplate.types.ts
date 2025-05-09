// Bot Template types
export interface BotTemplate {
  _id: string;
  name: string;
  description: string;
  entry_module?: string;
  exit_module?: string;
  dca_cutloss_module?: string;
  entry_hedge_module?: string;
  after_hedge_module?: string;
  stop_loss_module?: string;
  created_at: string;
  updated_at: string;
}

// Interface for creating a new bot template
export interface BotTemplateCreate {
  name: string;
  description: string;
  entry_module?: string;
  exit_module?: string;
  dca_cutloss_module?: string;
  entry_hedge_module?: string;
  after_hedge_module?: string;
  stop_loss_module?: string;
}

// Interface for updating a bot template
export interface BotTemplateUpdate {
  name?: string;
  description?: string;
  entry_module?: string | null;
  exit_module?: string | null;
  dca_cutloss_module?: string | null;
  entry_hedge_module?: string | null;
  after_hedge_module?: string | null;
  stop_loss_module?: string | null;
}

// Module type enum to match backend
export enum ModuleType {
  ENTRY = 'entry',
  EXIT = 'exit',
  DCA_CUTLOSS = 'dca_cutloss',
  ENTRY_HEDGE = 'entry_hedge',
  AFTER_HEDGE = 'after_hedge',
  STOP_LOSS = 'stop_loss'
}

// Map module type to field name for easier handling
export const moduleTypeToField: Record<ModuleType, keyof BotTemplate> = {
  [ModuleType.ENTRY]: 'entry_module',
  [ModuleType.EXIT]: 'exit_module',
  [ModuleType.DCA_CUTLOSS]: 'dca_cutloss_module',
  [ModuleType.ENTRY_HEDGE]: 'entry_hedge_module',
  [ModuleType.AFTER_HEDGE]: 'after_hedge_module',
  [ModuleType.STOP_LOSS]: 'stop_loss_module'
};