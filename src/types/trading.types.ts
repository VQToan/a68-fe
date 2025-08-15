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

export type AccountStatusType = "pending" | "valid" | "invalid" | "error" | "unsupported";

export interface AccountAsset {
  asset: string;
  wallet_balance: number;
  unrealized_pnl: number;
  margin_balance: number;
  available_balance: number;
  cross_wallet_balance: number;
  cross_un_pnl: number;
  margin_available: boolean;
  update_time: number;
}

export interface AccountBalance {
  total_wallet_balance: number;
  total_unrealized_pnl: number;
  total_margin_balance: number;
  available_balance: number;
  max_withdraw_amount: number;
  assets: AccountAsset[];
}

// New types for dashboard and position management
export interface BalanceSummary {
  asset: string;
  available: number;
  in_order: number;
  total: number;
}

export interface PositionSummary {
  order_id: string;
  symbol: string;
  side: string;
  position_side: string;
  quantity: number;
  entry_price: number;
  mark_price: number;
  liquidation_price: number;
  unrealized_pnl: number;
  pnl_percentage: number;
  timestamp: string;
}

export interface DashboardData {
  account_info: TradingAccount;
  balance_summary: BalanceSummary[];
  positions_summary: PositionSummary[];
  total_balance_usd: number;
  total_pnl: number;
  positions_count: number;
}

export interface OpenPositionRequest {
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  position_side?: "BOTH" | "LONG" | "SHORT";
  order_type?: "MARKET" | "LIMIT";
  price?: number;
  time_in_force?: "GTC" | "IOC" | "FOK";
}

export interface ClosePositionRequest {
  symbol: string;
  position_side?: "BOTH" | "LONG" | "SHORT";
  reduce_only?: boolean;
}

export interface ClosePartialPositionRequest {
  symbol: string;
  quantity: number;
  position_side: "BOTH" | "LONG" | "SHORT";
  reduce_only?: boolean;
}

export interface OrderInfo {
  symbol: string;
  order_id: number;
  client_order_id: string;
  side: "BUY" | "SELL";
  position_side?: "BOTH" | "LONG" | "SHORT";
  type: string;
  quantity: number;
  executed_quantity?: number;
  price: number;
  avg_price: number;
  stop_price: number;
  status: string;
  time_in_force: "GTC" | "IOC" | "FOK";
  reduce_only: boolean;
  close_position: boolean;
  update_time: number;
  remaining_position?: number;
}

export interface OrderResponse {
  success: boolean;
  order: OrderInfo;
  message: string;
}

export interface ClosePositionResponse {
  success: boolean;
  orders: OrderInfo[];
  message: string;
}

export interface ClosePartialPositionResponse {
  success: boolean;
  order: OrderInfo;
  message: string;
}

export interface TradingAccount {
  _id: string;
  user_id: string;
  exchange: TradingExchangeType;
  account_name: string;
  chat_ids: string[];
  created_at: string;
  updated_at: string;
  api_key_masked: string;
  status: AccountStatusType;
  balance?: AccountBalance;
}

export interface TradingAccountCreate {
  exchange: TradingExchangeType;
  account_name: string;
  api_key: string;
  secret_key: string;
  chat_ids?: string[];
}

export interface TradingAccountUpdate {
  account_name?: string;
  api_key?: string;
  secret_key?: string;
  chat_ids?: string[];
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
