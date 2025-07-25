// Trading types based on API documentation

export interface TradingStatus {
  CREATED: "created";
  QUEUED: "queued";
  RUNNING: "running";
  STOPPED: "stopped";
  FAILED: "failed";
  PAUSED: "paused";
}

export type TradingStatusType = "created" | "queued" | "running" | "stopped" | "failed" | "paused";

export interface TradingExchange {
  BINANCE: "binance";
  BYBIT: "bybit";
  OKX: "okx";
  BITGET: "bitget";
}

export type TradingExchangeType = "binance" | "bybit" | "okx" | "bitget";

export interface TradingAccount {
  _id: string;
  user_id: string;
  exchange: TradingExchangeType;
  account_name: string;
  chat_ids: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  api_key_masked: string;
}

export interface TradingAccountCreate {
  exchange: TradingExchangeType;
  account_name: string;
  api_key: string;
  secret_key: string;
  chat_ids?: string[];
  is_active?: boolean;
}

export interface TradingAccountUpdate {
  account_name?: string;
  api_key?: string;
  secret_key?: string;
  chat_ids?: string[];
  is_active?: boolean;
}

export interface TradingProcess {
  _id: string;
  name: string;
  description: string;
  user_id: string;
  bot_template_id: string;
  trading_account_id: string;
  parameters: any; // BotParameters from backtest
  created_at: string;
  updated_at: string;
  status: TradingStatusType;
  started_at: string | null;
  stopped_at: string | null;
  trading_account_name?: string;
  bot_template_name?: string;
}

export interface TradingProcessCreate {
  name: string;
  description: string;
  bot_template_id: string;
  trading_account_id: string;
  parameters?: any; // BotParameters
}

export interface TradingProcessUpdate {
  name?: string;
  description?: string;
  parameters?: any; // BotParameters
  trading_account_id?: string;
}

export interface TradingProcessPaginatedResponse {
  items: TradingProcess[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TradingAccountPaginatedResponse {
  items: TradingAccount[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
