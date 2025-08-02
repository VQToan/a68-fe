import { useState, useEffect, useCallback, memo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BalanceIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useTradingProcess } from "@hooks/useTradingProcess";
import { useNotification } from "@context/NotificationContext";
import { useNavigate, useParams } from "react-router-dom";
import { areEqual } from "@/utils/common";
import TradingProcessSetupInfo from "./components/TradingProcessSetupInfo";

// Mock interfaces for trading process metrics
interface TradingProcessMetrics {
  total_trades: number;
  win_rate: number;
  total_pnl: number;
  total_roi: number;
  current_balance: number;
  initial_balance: number;
  max_drawdown: number;
  profit_factor: number;
  sharpe_ratio: number;
}

// Mock interface for real trades (similar to backtest trades)
interface RealTrade {
  id: string;
  time: string;
  price: number;
  reason: string;
  quantity: number;
  side: "LONG" | "SHORT";
  pnl: number;
  position_result: string;
  position_pnl: number;
  balance?: number;
}

const TradingProcessDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // Hooks
  const {
    isLoading,
    error,
    getProcessById,
    startProcess,
    stopProcess,
    clearError,
  } = useTradingProcess();

  // Local state
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  
  // State for setup info dialog
  const [openSetupInfoDialog, setOpenSetupInfoDialog] = useState<boolean>(false);

  // Mock data - in real app, these would come from API
  const [processMetrics] = useState<TradingProcessMetrics>({
    total_trades: 145,
    win_rate: 68.5,
    total_pnl: 2456.78,
    total_roi: 24.57,
    current_balance: 12456.78,
    initial_balance: 10000.00,
    max_drawdown: -8.5,
    profit_factor: 1.85,
    sharpe_ratio: 1.42,
  });

  // Mock trading process with parameters
  const mockCurrentProcess = {
    _id: id || "tp1",
    name: "BTC-USDT Strategy RSI",
    user_id: "user1",
    bot_template_id: "template1",
    trading_account_id: "account1",
    description: "Chiến lược RSI cho BTC-USDT với DCA Grid",
    status: "running" as const,
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2024-01-15T09:00:00Z",
    started_at: "2024-01-15T09:00:00Z",
    stopped_at: null,
    trading_account_name: "Binance Main Account",
    bot_template_name: "RSI DCA Strategy",
    parameters: {
      SYMBOL: "BTCUSDT",
      LEVERAGE: 10,
      TRADE_MODE: 0, // Both long and short
      FUNDS: 1000,
      ENTRY_PERCENTAGE: 25,
      MAX_MARGIN_PERCENTAGE: 75,
      MIN_MARGIN: 50,
      MAX_LOSS: 200,
      MIN_ROI: 5,
      R2R: "1:2",
      MA_PERIOD: "20,50",
      DCA_GRID: 5,
      DCA_MULTIPLIER: 1.5,
      RSI_ENTRY_SHORT: 70,
      RSI_ENTRY_LONG: 30,
      RSI_EXIT_SHORT: 50,
      RSI_EXIT_LONG: 50,
      RSI_ENTRY_SHORT_CANDLE: 14,
      RSI_ENTRY_LONG_CANDLE: 14,
      RSI_EXIT_SHORT_CANDLE: 14,
      RSI_EXIT_LONG_CANDLE: 14,
      TIME_BETWEEN_ORDERS: 300, // 5 minutes
      PAUSE_TIME: "02:00-04:00",
      PAUSE_DAY: "Saturday,Sunday"
    }
  };

  // Use mock data instead of currentProcess for demo
  const processToShow = mockCurrentProcess;

  const [realTrades] = useState<RealTrade[]>([
    {
      id: "1",
      time: "2025-01-15 14:30:25",
      price: 45200.50,
      quantity: 0.01,
      side: "LONG",
      pnl: 4.50,
      position_result: "WIN",
      position_pnl: 4.50,
      reason: "Take Profit",
      balance: 10004.50,
    },
    {
      id: "2",
      time: "2025-01-15 13:15:10",
      price: 3180.25,
      quantity: 0.5,
      side: "SHORT",
      pnl: 27.23,
      position_result: "WIN",
      position_pnl: 27.23,
      reason: "Take Profit",
      balance: 10027.23,
    },
    {
      id: "3",
      time: "2025-01-15 12:45:05",
      price: 44950.00,
      quantity: 0.005,
      side: "LONG",
      pnl: -12.50,
      position_result: "LOSS",
      position_pnl: -12.50,
      reason: "Stop Loss",
      balance: 9987.50,
    },
  ]);

  // Fetch process details on mount
  useEffect(() => {
    if (id) {
      fetchProcessDetails();
    }
  }, [id]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showNotification(error, "error");
      clearError();
    }
  }, [error, showNotification, clearError]);

  // Fetch process details
  const fetchProcessDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      await getProcessById(id);
    } catch (error) {
      console.error("Error fetching process details:", error);
    }
  }, [id, getProcessById]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchProcessDetails();
    setIsRefreshing(false);
    showNotification("Dữ liệu đã được cập nhật", "success");
  }, [fetchProcessDetails, showNotification]);

  // Handle start/stop process
  const handleToggleProcess = useCallback(async () => {
    if (!processToShow) return;

    try {
      if (processToShow.status === "running") {
        await stopProcess(processToShow._id);
        showNotification("Trading process đã được dừng", "success");
      } else {
        await startProcess(processToShow._id);
        showNotification("Trading process đã được khởi động", "success");
      }
      await fetchProcessDetails(); // Refresh data
    } catch (error) {
      console.error("Error toggling process:", error);
    }
  }, [processToShow, startProcess, stopProcess, fetchProcessDetails, showNotification]);

  // Handle notifications toggle
  const handleNotificationsToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationsEnabled(event.target.checked);
    showNotification(
      event.target.checked 
        ? "Các thông tin về hoạt động của bot sẽ được cập nhật về tin nhắn của bạn" 
        : "Đã tắt thông báo qua message", 
      "success",
      
    );
  }, [setNotificationsEnabled, showNotification]);

  // Get status color
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, "success" | "error" | "warning" | "info" | "default"> = {
      running: "success",
      stopped: "error",
      paused: "warning",
      created: "info",
      queued: "info",
      failed: "error",
    };
    return statusColors[status] || "default";
  };

  // Get status display text
  const getStatusDisplayText = (status: string) => {
    const statusTexts: Record<string, string> = {
      running: "Đang chạy",
      stopped: "Đã dừng",
      paused: "Tạm dừng",
      created: "Đã tạo",
      queued: "Chờ xử lý",
      failed: "Lỗi",
    };
    return statusTexts[status] || status;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (!processToShow && !isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Không tìm thấy trading process
        </Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Quay lại
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h5" component="h1">
                Chi tiết Trading Process
              </Typography>
              {processToShow && (
                <Chip
                  label={getStatusDisplayText(processToShow.status)}
                  color={getStatusColor(processToShow.status)}
                />
              )}
            </Box>
            {processToShow && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {processToShow.name} • {processToShow.bot_template_name || "N/A"}
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: "auto" }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {/* Notifications Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={notificationsEnabled}
                    onChange={handleNotificationsToggle}
                    icon={<NotificationsOffIcon />}
                    checkedIcon={<NotificationsIcon />}
                  />
                }
                label="Thông báo"
              />
              
              {/* Start/Stop Button */}
              {processToShow && (
                <Button
                  variant={processToShow.status === "running" ? "outlined" : "contained"}
                  color={processToShow.status === "running" ? "error" : "success"}
                  startIcon={processToShow.status === "running" ? <StopIcon /> : <PlayIcon />}
                  onClick={handleToggleProcess}
                  disabled={isLoading}
                >
                  {processToShow.status === "running" ? "Dừng" : "Khởi động"}
                </Button>
              )}
              
              <Tooltip title="Làm mới">
                <IconButton 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              
              <Button 
                variant="outlined" 
                onClick={() => navigate(-1)}
              >
                Quay lại
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {/* Loading bar */}
        {(isLoading || isRefreshing) && (
          <LinearProgress sx={{ mt: 2 }} />
        )}
      </Paper>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* ROI Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    ROI
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color={processMetrics.total_roi >= 0 ? "success.main" : "error.main"}
                    sx={{ fontWeight: "bold" }}
                  >
                    {formatPercentage(processMetrics.total_roi)}
                  </Typography>
                </Box>
                {processMetrics.total_roi >= 0 ? (
                  <TrendingUpIcon color="success" fontSize="large" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="large" />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* PNL Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    PNL
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color={processMetrics.total_pnl >= 0 ? "success.main" : "error.main"}
                    sx={{ fontWeight: "bold" }}
                  >
                    {formatCurrency(processMetrics.total_pnl)}
                  </Typography>
                </Box>
                <BalanceIcon color="primary" fontSize="large" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Win Rate Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Tỷ lệ thắng
              </Typography>
              <Typography variant="h5" color="primary.main" sx={{ fontWeight: "bold" }}>
                {processMetrics.win_rate.toFixed(1)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={processMetrics.win_rate} 
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Total Trades Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Tổng giao dịch
              </Typography>
              <Typography variant="h5" color="primary.main" sx={{ fontWeight: "bold" }}>
                {processMetrics.total_trades}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                lệnh
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trades List */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6">
            Danh sách Giao dịch
          </Typography>
          <Tooltip title="Xem thông tin setup">
            <IconButton
              size="small"
              onClick={() => setOpenSetupInfoDialog(true)}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Thời gian</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Lý do</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>PNL</TableCell>
                <TableCell>Kết quả</TableCell>
                <TableCell>Position PNL</TableCell>
                <TableCell>Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {realTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="textSecondary">
                      Chưa có giao dịch nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                realTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell>
                      {new Date(trade.time).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>${trade.price.toFixed(2)}</TableCell>
                    <TableCell>{trade.reason}</TableCell>
                    <TableCell>{trade.quantity}</TableCell>
                    <TableCell>
                      <Chip 
                        label={trade.side}
                        color={trade.side === "LONG" ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        color={trade.pnl >= 0 ? "success.main" : "error.main"}
                        fontWeight="medium"
                      >
                        {trade.pnl >= 0 ? "+" : ""}{trade.pnl.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={trade.position_result}
                        color={trade.position_result === "WIN" ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        color={trade.position_pnl >= 0 ? "success.main" : "error.main"}
                        fontWeight="medium"
                      >
                        {trade.position_pnl >= 0 ? "+" : ""}{trade.position_pnl.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {trade.balance ? `$${trade.balance.toFixed(2)}` : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Setup Info Dialog */}
      <TradingProcessSetupInfo
        open={openSetupInfoDialog}
        onClose={() => setOpenSetupInfoDialog(false)}
        setupData={processToShow?.parameters}
      />
    </Box>
  );
};

export default memo(TradingProcessDetail, areEqual);
