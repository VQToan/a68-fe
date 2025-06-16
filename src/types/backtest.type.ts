// Backtest Process Status Type
export type BacktestStatus =
  | "created"
  | "queued"
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
  LEVERAGE: number;
  FUNDS: number;
  ENTRY_PERCENTAGE: number;
  MAX_MARGIN_PERCENTAGE: number;
  MIN_MARGIN: number;
  MAX_LOSS: number;
  MIN_ROI: number;
  R2R: string; // Risk to Reward ratio, default "1:2"
  MA_PERIOD: string;
  DCA_GRID: number;
  DCA_MULTIPLIER: number;
  RSI_ENTRY_SHORT: number;
  RSI_ENTRY_LONG: number;
  RSI_EXIT_SHORT: number;
  RSI_EXIT_LONG: number;
  RSI_ENTRY_SHORT_CANDLE: number;
  RSI_ENTRY_LONG_CANDLE: number;
  RSI_EXIT_SHORT_CANDLE: number;
  RSI_EXIT_LONG_CANDLE: number;
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
  created_at: number;
  status: BacktestStatus;
  summary?: string;
  progress: number;
  completed_at?: string | null;
  result_id?: string | null;
  num_results?: number;
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
