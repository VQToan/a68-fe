// Trading types based on API documentation

import type { BacktestParameter } from "./backtest.type";
export interface TradingStatus {
  CREATED: "created";
  QUEUED: "queued";
  RUNNING: "running";
  STOPPED: "stopped";
  FAILED: "failed";
  PAUSED: "paused";
}

// Notification types
export interface NotificationSetupRequest {
  process_id: string;
  status: boolean;
}

export interface NotificationStatusResponse {
  process_id: string;
  status: boolean;
}

export interface CombineBalanceStatusResponse {
  process_id: string;
  status: boolean;
  message?: string;
}

export interface CombineBalanceRequest {
  status: boolean;
}

export type TradingStatusType =
  | "created"
  | "queued"
  | "running"
  | "stopped"
  | "failed"
  | "paused";

export interface TradingExchange {
  BINANCE: "binance";
  BYBIT: "bybit";
  OKX: "okx";
  BITGET: "bitget";
}

export type TradingExchangeType = "binance" | "bybit" | "okx" | "bitget";

export type AccountStatusType =
  | "pending"
  | "valid"
  | "invalid"
  | "error"
  | "unsupported";

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

export interface SpotAssetBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface SpotBalanceResponse {
  balances?: SpotAssetBalance[];
  total_balance_btc?: number;
  total_balance_usdt?: number;
  update_time: number;
}

export interface SpotBalanceSummary {
  asset: string;
  available: number;
  in_order: number;
  total: number;
  btc_value?: number;
  usdt_value?: number;
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
  leverage?: number;
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
  parameters: Record<keyof BacktestParameter, any>;
  is_future: boolean;
  created_at: string;
  updated_at: string;
  status: TradingStatusType;
  started_at: string | null;
  stopped_at: string | null;
  trading_account_name?: string;
  bot_template_name?: string;
}

// Trading Details API types
export interface TradingDetail {
  _id?: string | null;
  time: number;
  price: number;
  reason: string;
  quantity: number;
  side: string;
  pnl: number;
  balance: number;
  position_result: string;
  position_pnl: number;
  position_avg_price: number;
  user_id: string;
  process_id: string;
}

export interface TradingDetailsResponse {
  details: TradingDetail[];
  total: number;
  process_id: string;
}

// Trading Performance API types
export interface TradingPerformanceMetrics {
  total_trades: number;
  total_orders: number;
  total_volume: number;
  win_rate: number;
  winning_trades: number;
  losing_trades: number;
  long_win_rate: number;
  short_win_rate: number;
  total_pnl: number;
  avg_pnl_per_trade: number;
  avg_long_pnl: number;
  avg_short_pnl: number;
  total_roi: number;
  avg_roi_per_trade: number;
  avg_long_roi: number;
  avg_short_roi: number;
  profit_factor: number;
  max_loss_occurrences: number;
  long_trades: number;
  short_trades: number;
}

export interface TradingPerformanceResponse {
  process_id: string;
  process_name?: string | null;
  initial_balance: number;
  current_balance: number;
  performance: TradingPerformanceMetrics;
  total_records: number;
}

export interface TradingProcessCreate {
  name: string;
  description: string;
  bot_template_id: string;
  trading_account_id: string;
  is_future?: boolean;
  parameters?: Record<keyof BacktestParameter, any>;
}

export interface TradingProcessUpdate {
  name?: string;
  description?: string;
  parameters?: Record<keyof BacktestParameter, any>;
  trading_account_id?: string;
  is_future?: boolean;
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

// =====================
// Trading Control Types
// =====================

// Position State for Trading Control
export interface PositionState {
  quantity: number;
  avg_price: number;
  entry_price: number;
  pnl: number;
  unrealized_pnl: number;
  roi: number;
  margin: number;
  dca_count: number;
  is_hedge: boolean;
}

// Trading State Response
export interface TradingStateResponse {
  trading_id: string;
  symbol: string;
  current_price: number;
  updated_at: string;
  long_position: PositionState;
  short_position: PositionState;
  is_online: boolean;
  balance: number;
  initial_balance: number;
  lowest_balance: number;
  highest_balance: number;
}

// Trading Command Action type
export type TradingCommandAction = "OPEN" | "CLOSE" | "CLOSE_ALL";

// Trading Side type
export type TradingSide = "LONG" | "SHORT" | "BOTH";

// Quantity interpretation type
export type QuantityType = "USDT" | "QUANTITY" | "USDT_PROFIT";

// Trading Reason type
export type TradingReason =
  | "ENTRY"
  | "ENTRY HEDGE"
  | "EXIT"
  | "EXIT TP2"
  | "EXIT SL BREAKEVEN"
  | "EXIT SL2"
  | "EXIT HEDGE"
  | "DCA"
  | "CUTLOSS"
  | "CUT LOSS HEDGE"
  | "PLUS HEDGE"
  | "MAX LOSS"
  | "WIPED OUT";

// Trading Command Request
export interface TradingCommandRequest {
  action: TradingCommandAction;
  side: TradingSide;
  quantity?: number | null;
  quantity_type?: QuantityType;
  reason?: TradingReason;
}

// Trading Command Response
export interface TradingCommandResponse {
  command_id: string;
  trading_id: string;
  status: string;
  message: string;
}

// Command History Item
export interface CommandHistoryItem {
  command_id: string;
  action: string;
  side: string;
  quantity: number | null;
  quantity_type: string | null;
  reason: string;
  status: "PENDING" | "EXECUTED" | "FAILED";
  result: Record<string, unknown> | null;
  error: string | null;
  created_at: number;
  executed_at: number | null;
}

// Active Trading State (for dashboard)
export interface ActiveTradingState {
  trading_id: string;
  symbol: string;
  current_price: number;
  updated_at: string;
  long_quantity: number;
  short_quantity: number;
  balance: number;
  lowest_balance: number;
  is_online: boolean;
}
