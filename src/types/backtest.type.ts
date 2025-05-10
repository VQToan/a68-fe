// Backtest Process Status Type
export type BacktestStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "stopped";

// Backtest interval type
export type BacktestInterval = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d";

// Backtest Parameter Type
export interface BacktestParameter {
  SYMBOL: string;
  START_DATE: number;
  END_DATE: number;
  INTERVAL_1: BacktestInterval;
  INTERVAL_2: BacktestInterval;
  TRADE_MODE: -1 | 0 | 1; // -1: short, 0: both, 1: long
  QUANTITY: number;
  LEVERAGE: number;
  TAKE_PROFIT: number;
  MIN_MARGIN: number;
  MAX_MARGIN: number;
  FUNDS: number;
  MIN_ROI: number;
  MA_PERIOD: string;
  DCA_GRID: number;
  DCA_MULTIPLIER: number;
  RSI_ENTRY_SHORT: number;
  RSI_ENTRY_LONG: number;
  RSI_EXIT_SHORT: number;
  RSI_EXIT_LONG: number;
  RSI_ENTRY_SHORT_CANCEL: number;
  RSI_ENTRY_LONG_CANCEL: number;
  RSI_EXIT_SHORT_CANCEL: number;
  RSI_EXIT_LONG_CANCEL: number;
  TIME_BETWEEN_ORDERS: number;
  PAUSE_TIME: string;
  PAUSE_DAY: string;
}
// Backtest Process Type
export interface BacktestProcess {
  _id: string;
  name: string;
  description: string;
  user_id: string;
  bot_template_id: string;
  parameters: Record<keyof BacktestParameter, any>;
  created_at: string;
  status: BacktestStatus;
  progress: number;
  completed_at?: string | null;
  result_id?: string | null;
}

// Create Backtest Process Type
export interface BacktestProcessCreate {
  name: string;
  description: string;
  bot_template_id: string;
  parameters: Record<keyof BacktestParameter, any>;
}

// Update Backtest Process Type
export interface BacktestProcessUpdate {
  name?: string | null;
  description?: string | null;
  parameters: Record<keyof BacktestParameter, any>;
}

// Backtest Process Action Type
export interface BacktestProcessAction {
  action: "run" | "stop";
}
