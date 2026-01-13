import { useState, useEffect, useCallback, memo } from "react";
import {
  Box,
  Paper,
  Tab,
  Tabs,
  Button,
  Typography,
  Skeleton,
} from "@mui/material";
import { useNotification } from "@context/NotificationContext";
import { useNavigate, useParams } from "react-router-dom";
import type {
  DashboardData,
  PositionSummary,
  OpenPositionRequest,
  ClosePositionRequest,
  ClosePartialPositionRequest,
  SpotBalanceResponse,
  OpenOrdersResponse,
  TakeProfitRequest,
  StopLossRequest,
} from "@/types/trading.types";
import { areEqual } from "@/utils/common";
import * as tradingAccountService from "@services/tradingAccount.service";
import {
  TradingAccountHeader,
  TradingAccountSummaryCards,
  AccountBalanceTab,
  SpotBalanceTab,
  PositionsTab,
  OrdersTab,
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [positions, setPositions] = useState<PositionSummary[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [spotBalance, setSpotBalance] = useState<SpotBalanceResponse | null>(
    null
  );
  const [isLoadingSpot, setIsLoadingSpot] = useState<boolean>(false);
  const [spotError, setSpotError] = useState<string | null>(null);

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
      const errorMessage =
        error instanceof Error ? error.message : fallbackMessage;
      setError(errorMessage);
      showNotification(errorMessage, "error");
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
      const errorMessage =
        error instanceof Error ? error.message : fallbackMessage;
      showNotification(errorMessage, "error");
    } finally {
      setIsLoadingPositions(false);
    }
  }, [id, showNotification, t]);

  // Fetch spot balance data
  const fetchSpotBalance = useCallback(async () => {
    if (!id) return;

    setIsLoadingSpot(true);
    setSpotError(null);

    try {
      const data = await tradingAccountService.getSpotBalance(id);
      setSpotBalance(data);
    } catch (error) {
      const fallbackMessage = t("tradingAccount.detail.errors.spotBalance");
      const errorMessage =
        error instanceof Error ? error.message : fallbackMessage;
      setSpotError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setIsLoadingSpot(false);
    }
  }, [id, showNotification, t]);

  // Handle refresh functionality
  const handleRefresh = useCallback(async () => {
    if (!id) return;

    setIsRefreshing(true);
    try {
      await tradingAccountService.refreshAccountData(id);
      await Promise.all([
        fetchDashboardData(),
        fetchPositions(),
        fetchSpotBalance(),
      ]);
      showNotification(
        t("tradingAccount.detail.notifications.refreshSuccess"),
        "success"
      );
    } catch (error) {
      const fallbackMessage = t("tradingAccount.detail.errors.refresh");
      const errorMessage =
        error instanceof Error ? error.message : fallbackMessage;
      showNotification(errorMessage, "error");
    } finally {
      setIsRefreshing(false);
    }
  }, [
    id,
    fetchDashboardData,
    fetchPositions,
    fetchSpotBalance,
    showNotification,
    t,
  ]);

  // Trading operations
  const handleOpenPosition = useCallback(
    async (data: OpenPositionRequest) => {
      if (!id) return;

      try {
        await tradingAccountService.openPosition(id, data);
        showNotification(
          t("tradingAccount.detail.notifications.openPosition"),
          "success"
        );
        await fetchPositions(); // Refresh positions
      } catch (error) {
        const fallbackMessage = t("tradingAccount.detail.errors.openPosition");
        const errorMessage =
          error instanceof Error ? error.message : fallbackMessage;
        showNotification(errorMessage, "error");
        throw error;
      }
    },
    [id, showNotification, fetchPositions, t]
  );

  const handleClosePosition = useCallback(
    async (data: ClosePositionRequest) => {
      if (!id) return;

      try {
        await tradingAccountService.closePosition(id, data);
        showNotification(
          t("tradingAccount.detail.notifications.closePosition"),
          "success"
        );
        await fetchPositions(); // Refresh positions
      } catch (error) {
        const fallbackMessage = t("tradingAccount.detail.errors.closePosition");
        const errorMessage =
          error instanceof Error ? error.message : fallbackMessage;
        showNotification(errorMessage, "error");
        throw error;
      }
    },
    [id, showNotification, fetchPositions, t]
  );

  const handleClosePartialPosition = useCallback(
    async (data: ClosePartialPositionRequest) => {
      if (!id) return;

      try {
        await tradingAccountService.closePartialPosition(id, data);
        showNotification(
          t("tradingAccount.detail.notifications.closePartialPosition"),
          "success"
        );
        await fetchPositions(); // Refresh positions
      } catch (error) {
        const fallbackMessage = t(
          "tradingAccount.detail.errors.closePartialPosition"
        );
        const errorMessage =
          error instanceof Error ? error.message : fallbackMessage;
        showNotification(errorMessage, "error");
        throw error;
      }
    },
    [id, showNotification, fetchPositions, t]
  );

  // Orders operations
  const handleGetOpenOrders = useCallback(
    async (symbol?: string): Promise<OpenOrdersResponse> => {
      if (!id) throw new Error("Account ID is required");
      return await tradingAccountService.getOpenOrders(id, symbol);
    },
    [id]
  );

  const handlePlaceTakeProfit = useCallback(
    async (data: TakeProfitRequest) => {
      if (!id) return;
      try {
        await tradingAccountService.placeTakeProfit(id, data);
        showNotification(
          t("tradingAccount.detail.notifications.takeProfitPlaced"),
          "success"
        );
      } catch (error) {
        const fallbackMessage = t(
          "tradingAccount.detail.errors.placeTakeProfit"
        );
        const errorMessage =
          error instanceof Error ? error.message : fallbackMessage;
        showNotification(errorMessage, "error");
        throw error;
      }
    },
    [id, showNotification, t]
  );

  const handlePlaceStopLoss = useCallback(
    async (data: StopLossRequest) => {
      if (!id) return;
      try {
        await tradingAccountService.placeStopLoss(id, data);
        showNotification(
          t("tradingAccount.detail.notifications.stopLossPlaced"),
          "success"
        );
      } catch (error) {
        const fallbackMessage = t("tradingAccount.detail.errors.placeStopLoss");
        const errorMessage =
          error instanceof Error ? error.message : fallbackMessage;
        showNotification(errorMessage, "error");
        throw error;
      }
    },
    [id, showNotification, t]
  );

  const handleCancelOrder = useCallback(
    async (orderId: number, symbol: string) => {
      if (!id) return;
      try {
        await tradingAccountService.cancelOrder(id, orderId, symbol);
        showNotification(
          t("tradingAccount.detail.notifications.orderCancelled"),
          "success"
        );
      } catch (error) {
        const fallbackMessage = t("tradingAccount.detail.errors.cancelOrder");
        const errorMessage =
          error instanceof Error ? error.message : fallbackMessage;
        showNotification(errorMessage, "error");
        throw error;
      }
    },
    [id, showNotification, t]
  );

  const handleCancelAllOrders = useCallback(
    async (symbol: string) => {
      if (!id) return;
      try {
        const response = await tradingAccountService.cancelAllOrders(
          id,
          symbol
        );
        showNotification(
          t("tradingAccount.detail.notifications.allOrdersCancelled", {
            count: response.cancelled_count,
          }),
          "success"
        );
      } catch (error) {
        const fallbackMessage = t(
          "tradingAccount.detail.errors.cancelAllOrders"
        );
        const errorMessage =
          error instanceof Error ? error.message : fallbackMessage;
        showNotification(errorMessage, "error");
        throw error;
      }
    },
    [id, showNotification, t]
  );

  // Fetch account details on mount
  useEffect(() => {
    if (id) {
      fetchDashboardData();
      fetchPositions();
      fetchSpotBalance();
    }
  }, [id, fetchDashboardData, fetchPositions, fetchSpotBalance]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    // Fetch positions when switching to positions tab
    if (newValue === "positions" && positions.length === 0) {
      fetchPositions();
    }
    if (newValue === "spot" && !spotBalance && !isLoadingSpot && !spotError) {
      fetchSpotBalance();
    }
    // No need to pre-fetch orders, OrdersTab handles its own fetching
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/trading-accounts");
  };

  // Loading state
  if (isLoading && !dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        {/* Header Skeleton */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            animation="wave"
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="30%" height={32} animation="wave" />
            <Skeleton variant="text" width="20%" height={20} animation="wave" />
          </Box>
          <Skeleton
            variant="rounded"
            width={100}
            height={36}
            animation="wave"
          />
        </Box>

        {/* Summary Cards Skeleton */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ flex: "1 1 200px" }}>
              <Paper sx={{ p: 2 }}>
                <Skeleton
                  variant="text"
                  width="60%"
                  height={20}
                  animation="wave"
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={32}
                  animation="wave"
                />
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Tabs Skeleton */}
        <Paper>
          <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
            <Box sx={{ display: "flex", gap: 3 }}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  variant="text"
                  width={80}
                  height={48}
                  animation="wave"
                />
              ))}
            </Box>
          </Box>
          <Box sx={{ p: 3 }}>
            <Skeleton
              variant="rectangular"
              height={300}
              animation="wave"
              sx={{ borderRadius: 1 }}
            />
          </Box>
        </Paper>
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
            <Tab
              label={t("tradingAccount.detail.tabs.balance")}
              value="balance"
            />
            <Tab label={t("tradingAccount.detail.tabs.spot")} value="spot" />
            <Tab
              label={t("tradingAccount.detail.tabs.positions")}
              value="positions"
            />
            <Tab
              label={t("tradingAccount.detail.tabs.orders")}
              value="orders"
            />
          </Tabs>
        </Box>

        {/* Balance Tab */}
        <CustomTabPanel value={currentTab} index="balance">
          <AccountBalanceTab account={dashboardData.account_info} />
        </CustomTabPanel>

        {/* Spot Balance Tab */}
        <CustomTabPanel value={currentTab} index="spot">
          <SpotBalanceTab
            data={spotBalance}
            isLoading={isLoadingSpot}
            error={spotError}
            onRetry={fetchSpotBalance}
          />
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
            onPlaceTakeProfit={handlePlaceTakeProfit}
            onPlaceStopLoss={handlePlaceStopLoss}
          />
        </CustomTabPanel>

        {/* Orders Tab */}
        <CustomTabPanel value={currentTab} index="orders">
          {id && (
            <OrdersTab
              accountId={id}
              onGetOrders={handleGetOpenOrders}
              onCancelOrder={handleCancelOrder}
              onCancelAllOrders={handleCancelAllOrders}
            />
          )}
        </CustomTabPanel>
      </Paper>
    </Box>
  );
};
export default memo(TradingAccountDetail, areEqual);
