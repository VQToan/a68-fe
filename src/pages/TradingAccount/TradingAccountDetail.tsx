import { useState, useEffect, useCallback, memo } from "react";
import {
  Box,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  Button,
  Typography,
} from "@mui/material";
import { useNotification } from "@context/NotificationContext";
import { useNavigate, useParams } from "react-router-dom";
import type { 
  DashboardData, 
  PositionSummary,
  OpenPositionRequest,
  ClosePositionRequest,
  ClosePartialPositionRequest
} from "@/types/trading.types";
import { areEqual } from "@/utils/common";
import * as tradingAccountService from "@services/tradingAccount.service";
import {
  TradingAccountHeader,
  TradingAccountSummaryCards,
  AccountBalanceTab,
  PositionsTab,
  TabPanel as CustomTabPanel,
} from "./components";
import { useTranslation } from "react-i18next";

const TradingAccountDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // Local state
  const [currentTab, setCurrentTab] = useState<string>("balance");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [positions, setPositions] = useState<PositionSummary[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await tradingAccountService.getAccountSummary(id);
      setDashboardData(data);
    } catch (error) {
      const fallbackMessage = t("tradingAccount.detail.errors.dashboard");
      const errorMessage = error instanceof Error ? error.message : fallbackMessage;
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, showNotification, t]);

  // Fetch positions data
  const fetchPositions = useCallback(async () => {
    if (!id) return;
    
    setIsLoadingPositions(true);
    
    try {
      const positionsData = await tradingAccountService.getPositions(id);
      setPositions(positionsData);
    } catch (error) {
      const fallbackMessage = t("tradingAccount.detail.errors.positions");
      const errorMessage = error instanceof Error ? error.message : fallbackMessage;
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoadingPositions(false);
    }
  }, [id, showNotification, t]);

  // Handle refresh functionality
  const handleRefresh = useCallback(async () => {
    if (!id) return;
    
    setIsRefreshing(true);
    try {
      await tradingAccountService.refreshAccountData(id);
      await Promise.all([fetchDashboardData(), fetchPositions()]);
      showNotification(t("tradingAccount.detail.notifications.refreshSuccess"), 'success');
    } catch (error) {
      const fallbackMessage = t("tradingAccount.detail.errors.refresh");
      const errorMessage = error instanceof Error ? error.message : fallbackMessage;
      showNotification(errorMessage, 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [id, fetchDashboardData, fetchPositions, showNotification, t]);

  // Trading operations
  const handleOpenPosition = useCallback(async (data: OpenPositionRequest) => {
    if (!id) return;
    
    try {
      await tradingAccountService.openPosition(id, data);
      showNotification(t("tradingAccount.detail.notifications.openPosition"), 'success');
      await fetchPositions(); // Refresh positions
    } catch (error) {
      const fallbackMessage = t("tradingAccount.detail.errors.openPosition");
      const errorMessage = error instanceof Error ? error.message : fallbackMessage;
      showNotification(errorMessage, 'error');
      throw error;
    }
  }, [id, showNotification, fetchPositions, t]);

  const handleClosePosition = useCallback(async (data: ClosePositionRequest) => {
    if (!id) return;
    
    try {
      await tradingAccountService.closePosition(id, data);
      showNotification(t("tradingAccount.detail.notifications.closePosition"), 'success');
      await fetchPositions(); // Refresh positions
    } catch (error) {
      const fallbackMessage = t("tradingAccount.detail.errors.closePosition");
      const errorMessage = error instanceof Error ? error.message : fallbackMessage;
      showNotification(errorMessage, 'error');
      throw error;
    }
  }, [id, showNotification, fetchPositions, t]);

  const handleClosePartialPosition = useCallback(async (data: ClosePartialPositionRequest) => {
    if (!id) return;
    
    try {
      await tradingAccountService.closePartialPosition(id, data);
      showNotification(t("tradingAccount.detail.notifications.closePartialPosition"), 'success');
      await fetchPositions(); // Refresh positions
    } catch (error) {
      const fallbackMessage = t("tradingAccount.detail.errors.closePartialPosition");
      const errorMessage = error instanceof Error ? error.message : fallbackMessage;
      showNotification(errorMessage, 'error');
      throw error;
    }
  }, [id, showNotification, fetchPositions, t]);

  // Fetch account details on mount
  useEffect(() => {
    if (id) {
      fetchDashboardData();
      fetchPositions();
    }
  }, [id, fetchDashboardData, fetchPositions]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    // Fetch positions when switching to positions tab
    if (newValue === "positions" && positions.length === 0) {
      fetchPositions();
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/trading-accounts');
  };

  // Loading state
  if (isLoading && !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          {t("tradingAccount.detail.actions.back")}
        </Button>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          {t("tradingAccount.detail.empty")}
        </Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          {t("tradingAccount.detail.actions.back")}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <TradingAccountHeader
        account={dashboardData.account_info}
        onBack={handleBack}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Summary Cards */}
      <TradingAccountSummaryCards dashboardData={dashboardData} />

      {/* Tabs */}
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label={t("tradingAccount.detail.tabs.balance") } value="balance" />
            <Tab label={t("tradingAccount.detail.tabs.positions") } value="positions" />
          </Tabs>
        </Box>

        {/* Balance Tab */}
        <CustomTabPanel value={currentTab} index="balance">
          <AccountBalanceTab account={dashboardData.account_info} />
        </CustomTabPanel>

        {/* Positions Tab */}
        <CustomTabPanel value={currentTab} index="positions">
          <PositionsTab
            positions={positions}
            isLoading={isLoadingPositions}
            onRefresh={fetchPositions}
            onOpenPosition={handleOpenPosition}
            onClosePosition={handleClosePosition}
            onClosePartialPosition={handleClosePartialPosition}
          />
        </CustomTabPanel>
      </Paper>
    </Box>
  );
};
export default memo(TradingAccountDetail, areEqual);
