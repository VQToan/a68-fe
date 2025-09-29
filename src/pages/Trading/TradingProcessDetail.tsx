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
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from "@mui/icons-material";
import { useTradingProcess } from "@hooks/useTradingProcess";
import { useNotification } from "@context/NotificationContext";
import { useNavigate, useParams } from "react-router-dom";
import { areEqual } from "@/utils/common";
import TradingProcessSetupInfo from "./components/TradingProcessSetupInfo";
import StopTradingConfirmDialog from "./components/StopTradingConfirmDialog";
import TradingDetailsList from "./components/TradingDetailsList";
import type { TradingPerformanceResponse } from "@/types/trading.types";
import * as tradingProcessService from "@services/tradingProcess.service";
import { useTranslation } from "react-i18next";

const TradingProcessDetail = () => {
  const { t } = useTranslation();
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
  const [combineBalanceEnabled, setCombineBalanceEnabled] = useState<boolean>(false);
  const [isLoadingCombineBalance, setIsLoadingCombineBalance] = useState<boolean>(false);
  const [performanceData, setPerformanceData] = useState<TradingPerformanceResponse | null>(null);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState<boolean>(false);
  
  // State for setup info dialog
  const [openSetupInfoDialog, setOpenSetupInfoDialog] = useState<boolean>(false);
  // State for confirm stop
  const [confirmStopOpen, setConfirmStopOpen] = useState<boolean>(false);

  // Fetch performance data
  const fetchPerformanceData = useCallback(async () => {
    if (!id) return;
    
    setIsLoadingPerformance(true);
    try {
      const performance = await tradingProcessService.getTradingPerformance(id);
      setPerformanceData(performance);
    } catch (error) {
      const fallbackMessage = t("trading.detail.errors.performance");
      const errorMessage = error instanceof Error ? error.message : fallbackMessage;
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoadingPerformance(false);
    }
  }, [id, showNotification, t]);

  // Fetch notification status
  const fetchNotificationStatus = useCallback(async () => {
    if (!id) return;
    
    setIsLoadingNotifications(true);
    try {
      const notificationStatus = await tradingProcessService.getNotificationStatus(id);
      setNotificationsEnabled(notificationStatus.status);
    } catch (error) {
      const fallbackMessage = t("trading.detail.errors.notificationStatus");
      const errorMessage = error instanceof Error ? error.message : fallbackMessage;
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [id, showNotification, t]);

  const fetchCombineBalanceStatus = useCallback(async () => {
    if (!id) return;

    setIsLoadingCombineBalance(true);
    try {
      const response = await tradingProcessService.getCombineBalanceStatus(id);
      setCombineBalanceEnabled(Boolean(response.status));
    } catch (error) {
      const fallbackMessage = t("trading.detail.errors.combineBalanceStatus");
      const errorMessage = error instanceof Error ? error.message : fallbackMessage;
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoadingCombineBalance(false);
    }
  }, [id, showNotification, t]);

  // Fetch process details on mount
  useEffect(() => {
    if (id) {
      fetchProcessDetails();
      fetchPerformanceData();
      fetchNotificationStatus();
      fetchCombineBalanceStatus();
    }
  }, [id, fetchCombineBalanceStatus]);

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
    await Promise.all([
      fetchProcessDetails(),
      fetchPerformanceData(),
      fetchNotificationStatus(),
      fetchCombineBalanceStatus(),
    ]);
    setIsRefreshing(false);
    showNotification(t("trading.detail.notifications.refreshSuccess"), "success");
  }, [
    fetchProcessDetails,
    fetchPerformanceData,
    fetchNotificationStatus,
    fetchCombineBalanceStatus,
    showNotification,
    t,
  ]);

  // Handle start/stop process
  const handleToggleProcess = useCallback(async () => {
    if (!currentProcess) return;

    try {
      if (currentProcess.status === "running") {
        // Ask for confirmation before stopping
        setConfirmStopOpen(true);
        return;
      } else {
        await startProcess(currentProcess._id);
        showNotification(t("trading.detail.notifications.startSuccess"), "success");
      }
      await fetchProcessDetails(); // Refresh data
      await fetchPerformanceData(); // Refresh performance data
    } catch (error) {
      console.error("Error toggling process:", error);
    }
  }, [currentProcess, startProcess, fetchProcessDetails, fetchPerformanceData, showNotification, t]);

  const handleConfirmStop = useCallback(async (shouldClearPositions: boolean) => {
    if (!currentProcess) return;
    try {
      await stopProcess(currentProcess._id, shouldClearPositions ? true : undefined);
      const message = shouldClearPositions
        ? t("trading.detail.notifications.stopWithCloseSuccess")
        : t("trading.detail.notifications.stopSuccess");
      showNotification(message, "success");
      setConfirmStopOpen(false);
      await fetchProcessDetails();
      await fetchPerformanceData();
    } catch (error) {
      console.error("Error stopping process:", error);
    }
  }, [currentProcess, stopProcess, fetchProcessDetails, fetchPerformanceData, showNotification, t]);

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
          ? t("trading.detail.notifications.enabled")
          : t("trading.detail.notifications.disabled"),
        "success"
      );
    } catch (error) {
      const fallbackMessage = t("trading.detail.errors.updateNotificationStatus");
      const errorMessage = error instanceof Error ? error.message : fallbackMessage;
      showNotification(errorMessage, 'error');
      // Reset switch to previous state if update failed
      // The switch will stay at previous state since we don't update state on error
    }
  }, [id, showNotification, t]);

  const handleCombineBalanceToggle = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!id) return;

    const newStatus = event.target.checked;
    try {
      await tradingProcessService.setCombineBalance(id, {
        status: newStatus,
      });
      setCombineBalanceEnabled(newStatus);
      showNotification(
        newStatus
          ? t("trading.detail.notifications.combineBalanceEnabled")
          : t("trading.detail.notifications.combineBalanceDisabled"),
        "success"
      );
    } catch (error) {
      const fallbackMessage = t("trading.detail.errors.updateCombineBalanceStatus");
      const errorMessage = error instanceof Error ? error.message : fallbackMessage;
      showNotification(errorMessage, 'error');
    }
  }, [id, showNotification, t]);

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
  const getStatusDisplayText = useCallback((status: string) => {
    const statusTexts: Record<string, string> = {
      running: t("trading.detail.status.running"),
      stopped: t("trading.detail.status.stopped"),
      paused: t("trading.detail.status.paused"),
      created: t("trading.detail.status.created"),
      queued: t("trading.detail.status.queued"),
      failed: t("trading.detail.status.failed"),
    };
    return statusTexts[status] || status;
  }, [t]);

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
          {t("trading.detail.empty")}
        </Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          {t("trading.detail.actions.back")}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2.5, md: 3 }, mb: 3, overflow: 'hidden', borderRadius: { xs: 1.5, md: 2 } }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 12, md: 'auto' }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h5" component="h1">
                {t("trading.detail.header.title")}
              </Typography>
              {currentProcess && (
                <Chip
                  label={getStatusDisplayText(currentProcess.status)}
                  color={getStatusColor(currentProcess.status)}
                />
              )}
            </Box>
            {currentProcess && (
              <>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {currentProcess.name} • {currentProcess.bot_template_name || t("common.notAvailable")}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                  {(() => {
                    if (!currentProcess.started_at) {
                      return t("trading.detail.runningDays.none");
                    }
                    const start = new Date(currentProcess.started_at).getTime();
                    const end = currentProcess.status === "running" || !currentProcess.stopped_at
                      ? Date.now()
                      : new Date(currentProcess.stopped_at).getTime();
                    const diffDays = Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
                    return t("trading.detail.runningDays.value", { count: diffDays });
                  })()}
                </Typography>
              </>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 'auto' }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
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
                sx={{ gap: 1 }}
                label={t("trading.detail.controls.notifications")}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={combineBalanceEnabled}
                    onChange={handleCombineBalanceToggle}
                    disabled={isLoadingCombineBalance}
                    icon={<AccountBalanceWalletIcon />}
                    checkedIcon={<AccountBalanceWalletIcon />}
                  />
                }
                sx={{ gap: 1 }}
                label={t("trading.detail.controls.combineBalance")}
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
                  {currentProcess.status === "running"
                    ? t("trading.detail.actions.stop")
                    : t("trading.detail.actions.start")}
                </Button>
              )}
              
              <Tooltip title={t("trading.detail.actions.refresh")}>
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
                {t("trading.detail.actions.back")}
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
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* ROI Card */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {t("trading.detail.metrics.roi")}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color={(performanceData?.performance.total_roi ?? 0) >= 0 ? "success.main" : "error.main"}
                    sx={{ fontWeight: "bold" }}
                  >
                    {formatPercentage(performanceData?.performance.total_roi ?? 0)}
                  </Typography>
                </Box>
                {(performanceData?.performance.total_roi ?? 0) >= 0 ? (
                  <TrendingUpIcon color="success" fontSize="medium" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="medium" />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* PNL Card */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {t("trading.detail.metrics.pnl")}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color={(performanceData?.performance.total_pnl ?? 0) >= 0 ? "success.main" : "error.main"}
                    sx={{ fontWeight: "bold" }}
                  >
                    {formatCurrency(performanceData?.performance.total_pnl ?? 0)}
                  </Typography>
                </Box>
                <BalanceIcon color="primary" fontSize="medium" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Win Rate Card */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="textSecondary">
                {t("trading.detail.metrics.winRate")}
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: "bold" }}>
                {(performanceData?.performance.win_rate ?? 0).toFixed(1)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={performanceData?.performance.win_rate ?? 0} 
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Total Trades Card */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="textSecondary">
                {t("trading.detail.metrics.totalTrades")}
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: "bold" }}>
                {performanceData?.performance.total_orders ?? 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {t("trading.detail.metrics.ordersLabel")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Volume Card */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="textSecondary">
                {t("trading.detail.metrics.totalVolume")}
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: "bold" }}>
                {(performanceData?.performance.total_volume ?? 0).toLocaleString('en-US')}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {t("trading.detail.metrics.volumeUnit")}
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

      {/* Confirm Stop Dialog */}
      <StopTradingConfirmDialog
        open={confirmStopOpen}
        processName={currentProcess?.name}
        accountId={currentProcess?.trading_account_id}
        symbol={currentProcess?.parameters?.SYMBOL as string | undefined}
        onClose={() => setConfirmStopOpen(false)}
        onStop={handleConfirmStop}
      />
    </Box>
  );
};

export default memo(TradingProcessDetail, areEqual);
