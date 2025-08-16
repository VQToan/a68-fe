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
  LinearProgress,
  Tooltip,
  IconButton,
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
} from "@mui/icons-material";
import { useTradingProcess } from "@hooks/useTradingProcess";
import { useNotification } from "@context/NotificationContext";
import { useNavigate, useParams } from "react-router-dom";
import { areEqual } from "@/utils/common";
import TradingProcessSetupInfo from "./components/TradingProcessSetupInfo";
import TradingDetailsList from "./components/TradingDetailsList";
import type { TradingPerformanceResponse } from "@/types/trading.types";
import * as tradingProcessService from "@services/tradingProcess.service";

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
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(false);
  const [performanceData, setPerformanceData] = useState<TradingPerformanceResponse | null>(null);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState<boolean>(false);
  
  // State for setup info dialog
  const [openSetupInfoDialog, setOpenSetupInfoDialog] = useState<boolean>(false);

  // Fetch performance data
  const fetchPerformanceData = useCallback(async () => {
    if (!id) return;
    
    setIsLoadingPerformance(true);
    try {
      const performance = await tradingProcessService.getTradingPerformance(id);
      setPerformanceData(performance);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch performance data';
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoadingPerformance(false);
    }
  }, [id, showNotification]);

  // Fetch notification status
  const fetchNotificationStatus = useCallback(async () => {
    if (!id) return;
    
    setIsLoadingNotifications(true);
    try {
      const notificationStatus = await tradingProcessService.getNotificationStatus(id);
      setNotificationsEnabled(notificationStatus.status);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notification status';
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [id, showNotification]);

  // Fetch process details on mount
  useEffect(() => {
    if (id) {
      fetchProcessDetails();
      fetchPerformanceData();
      fetchNotificationStatus();
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
    await Promise.all([fetchProcessDetails(), fetchPerformanceData(), fetchNotificationStatus()]);
    setIsRefreshing(false);
    showNotification("Dữ liệu đã được cập nhật", "success");
  }, [fetchProcessDetails, fetchPerformanceData, fetchNotificationStatus, showNotification]);

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
      await fetchPerformanceData(); // Refresh performance data
    } catch (error) {
      console.error("Error toggling process:", error);
    }
  }, [currentProcess, startProcess, stopProcess, fetchProcessDetails, fetchPerformanceData, showNotification]);

  // Handle notifications toggle
  const handleNotificationsToggle = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!id) return;

    const newStatus = event.target.checked;
    
    try {
      await tradingProcessService.updateNotificationStatus({
        process_id: id,
        status: newStatus
      });
      
      setNotificationsEnabled(newStatus);
      showNotification(
        newStatus 
          ? "Các thông tin về hoạt động của bot sẽ được cập nhật về tin nhắn của bạn" 
          : "Đã tắt thông báo qua message", 
        "success"
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update notification status';
      showNotification(errorMessage, 'error');
      // Reset switch to previous state if update failed
      // The switch will stay at previous state since we don't update state on error
    }
  }, [id, showNotification]);

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
                    disabled={isLoadingNotifications}
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
        {(isLoading || isRefreshing || isLoadingPerformance) && (
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
                    color={(performanceData?.performance.total_roi ?? 0) >= 0 ? "success.main" : "error.main"}
                    sx={{ fontWeight: "bold" }}
                  >
                    {formatPercentage(performanceData?.performance.total_roi ?? 0)}
                  </Typography>
                </Box>
                {(performanceData?.performance.total_roi ?? 0) >= 0 ? (
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
                    color={(performanceData?.performance.total_pnl ?? 0) >= 0 ? "success.main" : "error.main"}
                    sx={{ fontWeight: "bold" }}
                  >
                    {formatCurrency(performanceData?.performance.total_pnl ?? 0)}
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
                {(performanceData?.performance.win_rate ?? 0).toFixed(1)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={performanceData?.performance.win_rate ?? 0} 
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
                {performanceData?.performance.total_trades ?? 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                lệnh
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trades List */}
      <TradingDetailsList 
        processId={id || ""} 
        onShowSetupInfo={() => setOpenSetupInfoDialog(true)}
      />

      {/* Setup Info Dialog */}
      <TradingProcessSetupInfo
        open={openSetupInfoDialog}
        onClose={() => setOpenSetupInfoDialog(false)}
        setupData={currentProcess?.parameters}
      />
    </Box>
  );
};

export default memo(TradingProcessDetail, areEqual);
