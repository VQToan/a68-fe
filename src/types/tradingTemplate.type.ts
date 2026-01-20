export interface ReleaseTemplateInput {
  name?: string;
  description?: string;
  icon?: string;
}

export interface ToggleActiveInput {
  is_active: boolean;
}

export interface TradingTemplateUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface BotModuleInfo {
  _id: string;
  name: string;
  name_in_source: string;
  type: string;
}

export interface BotModules {
  entry?: BotModuleInfo | null;
  exit?: BotModuleInfo | null;
  dca_cutloss?: BotModuleInfo | null;
  entry_hedge?: BotModuleInfo | null;
  after_hedge?: BotModuleInfo | null;
  stop_loss?: BotModuleInfo | null;
}

export interface TradingTemplate {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  is_future: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  aggregated_metrics?: any;
  bot_modules?: BotModules | null;
}

export interface TradingTemplateListItem {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  is_future: boolean;
  is_active: boolean;
  aggregated_metrics?: any;
}
