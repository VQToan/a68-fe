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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
    currentProcess,
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
    if (!currentProcess) return;

    try {
      if (currentProcess.status === "running") {
        await stopProcess(currentProcess._id);
        showNotification("Trading process đã được dừng", "success");
      } else {
        await startProcess(currentProcess._id);
        showNotification("Trading process đã được khởi động", "success");
      }
      await fetchProcessDetails(); // Refresh data
    } catch (error) {
      console.error("Error toggling process:", error);
    }
  }, [currentProcess, startProcess, stopProcess, fetchProcessDetails, showNotification]);

  // Handle notifications toggle
  const handleNotificationsToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationsEnabled(event.target.checked);
    showNotification(
      event.target.checked 
        ? "Đã bật thông báo qua message" 
        : "Đã tắt thông báo qua message", 
      "success"
    );
  }, [showNotification]);

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

  if (!currentProcess && !isLoading) {
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
              {currentProcess && (
                <Chip 
                  label={getStatusDisplayText(currentProcess.status)}
                  color={getStatusColor(currentProcess.status)}
                />
              )}
            </Box>
            {currentProcess && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {currentProcess.name} • {currentProcess.bot_template_name || "N/A"}
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
              {currentProcess && (
                <Button
                  variant={currentProcess.status === "running" ? "outlined" : "contained"}
                  color={currentProcess.status === "running" ? "error" : "success"}
                  startIcon={currentProcess.status === "running" ? <StopIcon /> : <PlayIcon />}
                  onClick={handleToggleProcess}
                  disabled={isLoading}
                >
                  {currentProcess.status === "running" ? "Dừng" : "Khởi động"}
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
      <Dialog 
        open={openSetupInfoDialog} 
        onClose={() => setOpenSetupInfoDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Thông tin Setup Trading Process</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ pt: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Balance hiện tại
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {formatCurrency(processMetrics.current_balance)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Balance ban đầu
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(processMetrics.initial_balance)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Max Drawdown
                </Typography>
                <Typography variant="h6" color="error.main">
                  {formatPercentage(processMetrics.max_drawdown)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Profit Factor  
                </Typography>
                <Typography variant="h6" color="success.main">
                  {processMetrics.profit_factor.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Sharpe Ratio
                </Typography>
                <Typography variant="h6" color="info.main">
                  {processMetrics.sharpe_ratio.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ textAlign: "center", p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Tổng số giao dịch
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {processMetrics.total_trades}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSetupInfoDialog(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default memo(TradingProcessDetail, areEqual);
