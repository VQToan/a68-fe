
// Backtest Result Metrics Type
export interface BacktestResultMetrics {
  total_trades: number;
  win_rate: number;
  total_pnl: number;
  total_roi: number;
  mdd: number;
  [key: string]: any; // For additional metrics
}

// Backtest Result Trade Type
export interface BacktestResultTrade {
  time: number;
  price: number;
  reason: string;
  quantity: number;
  side: "LONG" | "SHORT";
  pnl: number;
  position_result: string;
  position_pnl: number;
  balance?: number;
}

// Backtest Result Summary Type (for list view)
export interface BacktestResultSummary {
  _id: string;
  process_id: string;
  start_date: number;
  end_date: number;
  metrics: BacktestResultMetrics;
  created_at: string;
}

// Backtest Result Detail Type (full detail with trades)
export interface BacktestResultDetail {
  _id: string;
  process_id: string;
  start_date: number;
  end_date: number;
  trades: BacktestResultTrade[];
  metrics: BacktestResultMetrics;
  created_at: string;
}

// API Response Type for Delete Operation
export interface DeleteBacktestResultResponse {
  success: boolean;
  message: string;
}