import { useState, useEffect, useCallback, memo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Tab,
  Tabs,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import {
  AccountBalance as BalanceIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNotification } from "@context/NotificationContext";
import { useNavigate, useParams } from "react-router-dom";
import type { DashboardData, PositionSummary, AccountStatusType } from "@/types/trading.types";
import { areEqual } from "@/utils/common";
import * as tradingAccountService from "@services/tradingAccount.service";

// Status chip color mapping
const getStatusColor = (status: AccountStatusType): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case "valid":
      return "success";
    case "invalid":
      return "error";
    case "pending":
      return "warning";
    case "error":
      return "error";
    case "unsupported":
      return "default";
    default:
      return "default";
  }
};

const getStatusLabel = (status: AccountStatusType): string => {
  switch (status) {
    case "valid":
      return "Hợp lệ";
    case "invalid":
      return "Không hợp lệ";
    case "pending":
      return "Đang xác thực";
    case "error":
      return "Lỗi";
    case "unsupported":
      return "Không hỗ trợ";
    default:
      return String(status).toUpperCase();
  }
};

const getExchangeDisplayName = (exchange: string): string => {
  const exchangeNames: Record<string, string> = {
    binance: "Binance",
    bybit: "Bybit",
    okx: "OKX",
    bitget: "Bitget",
  };
  return exchangeNames[exchange] || exchange.toUpperCase();
};

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-detail-tabpanel-${index}`}
      aria-labelledby={`account-detail-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const TradingAccountDetail = () => {
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, showNotification]);

  // Fetch positions data
  const fetchPositions = useCallback(async () => {
    if (!id) return;
    
    setIsLoadingPositions(true);
    
    try {
      const positionsData = await tradingAccountService.getPositions(id);
      setPositions(positionsData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch positions';
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoadingPositions(false);
    }
  }, [id, showNotification]);

  // Handle refresh functionality
  const handleRefresh = useCallback(async () => {
    if (!id) return;
    
    setIsRefreshing(true);
    try {
      await tradingAccountService.refreshAccountData(id);
      await Promise.all([fetchDashboardData(), fetchPositions()]);
      showNotification('Dữ liệu đã được làm mới', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh data';
      showNotification(errorMessage, 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [id, fetchDashboardData, fetchPositions, showNotification]);

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
          Quay lại
        </Button>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Không tìm thấy tài khoản trading
        </Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Quay lại
        </Button>
      </Box>
    );
  }

  const { account_info, total_balance_usd, total_pnl, positions_count } = dashboardData;

  return (
    <Box>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h5" component="h1">
                Chi tiết Tài khoản Trading
              </Typography>
              {account_info && (
                <Chip 
                  label={getStatusLabel(account_info.status)}
                  color={getStatusColor(account_info.status)}
                  size="small"
                />
              )}
            </Box>
            {account_info && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {account_info.account_name} • {getExchangeDisplayName(account_info.exchange)}
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: "auto" }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
              >
                Quay lại
              </Button>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? "Đang làm mới..." : "Làm mới"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <BalanceIcon color="primary" />
                <Box>
                  <Typography variant="h6">
                    ${account_info?.balance?.total_wallet_balance ? account_info.balance.total_wallet_balance.toFixed(8) : total_balance_usd.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tổng số dư
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TrendingUpIcon color={
                  (account_info?.balance?.total_unrealized_pnl !== undefined ? account_info.balance.total_unrealized_pnl : total_pnl) >= 0 ? "success" : "error"
                } />
                <Box>
                  <Typography 
                    variant="h6" 
                    color={
                      (account_info?.balance?.total_unrealized_pnl !== undefined ? account_info.balance.total_unrealized_pnl : total_pnl) >= 0 ? "success.main" : "error.main"
                    }
                  >
                    ${account_info?.balance?.total_unrealized_pnl !== undefined 
                      ? account_info.balance.total_unrealized_pnl.toFixed(8) 
                      : total_pnl.toFixed(2)
                    }
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    PnL chưa thực hiện
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TrendingUpIcon color="info" />
                <Box>
                  <Typography variant="h6">{positions_count}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Lệnh đang mở
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Balance" value="balance" />
            <Tab label="Lệnh đang mở" value="positions" />
          </Tabs>
        </Box>

        {/* Balance Tab */}
        <TabPanel value={currentTab} index="balance">
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Chi tiết Balance
            </Typography>
            
            {/* Summary Cards */}
            {account_info?.balance && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="textSecondary">
                        Tổng số dư ví
                      </Typography>
                      <Typography variant="h6">
                        ${account_info.balance.total_wallet_balance.toFixed(8)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="textSecondary">
                        Số dư khả dụng
                      </Typography>
                      <Typography variant="h6">
                        ${account_info.balance.available_balance.toFixed(8)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="textSecondary">
                        PnL chưa thực hiện
                      </Typography>
                      <Typography 
                        variant="h6"
                        color={account_info.balance.total_unrealized_pnl >= 0 ? "success.main" : "error.main"}
                      >
                        ${account_info.balance.total_unrealized_pnl.toFixed(8)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="textSecondary">
                        Số tiền có thể rút
                      </Typography>
                      <Typography variant="h6">
                        ${account_info.balance.max_withdraw_amount.toFixed(8)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Assets Details */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Chi tiết từng Asset
            </Typography>
            
            {account_info?.balance?.assets && account_info.balance.assets.length > 0 ? (
              account_info.balance.assets.map((asset, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography variant="h6">{asset.asset}</Typography>
                      <Chip 
                        label={asset.margin_available ? "Margin khả dụng" : "Margin không khả dụng"}
                        color={asset.margin_available ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Số dư ví
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {asset.wallet_balance.toFixed(8)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Số dư khả dụng
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {asset.available_balance.toFixed(8)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Số dư margin
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {asset.margin_balance.toFixed(8)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            PnL chưa thực hiện
                          </Typography>
                          <Typography 
                            variant="body1" 
                            fontWeight="medium"
                            color={asset.unrealized_pnl >= 0 ? "success.main" : "error.main"}
                          >
                            {asset.unrealized_pnl.toFixed(8)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Cross wallet balance
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {asset.cross_wallet_balance.toFixed(8)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Cập nhật lần cuối
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(asset.update_time).toLocaleString('vi-VN')}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="textSecondary">
                  Không có dữ liệu balance
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Positions Tab */}
        <TabPanel value={currentTab} index="positions">
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">
                Lệnh đang mở ({positions.length})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchPositions}
                disabled={isLoadingPositions}
                size="small"
              >
                {isLoadingPositions ? "Đang tải..." : "Làm mới"}
              </Button>
            </Box>
            
            {isLoadingPositions ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : positions.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1" color="textSecondary">
                  Không có lệnh nào đang mở
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã lệnh</TableCell>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Loại</TableCell>
                      <TableCell>Số lượng</TableCell>
                      <TableCell>Giá vào</TableCell>
                      <TableCell>Giá hiện tại</TableCell>
                      <TableCell>Liquid</TableCell>
                      <TableCell>PnL</TableCell>
                      <TableCell>Thời gian</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {positions.map((position: PositionSummary, index: number) => (
                      <TableRow key={`${position.order_id}-${index}`} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {position.order_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {position.symbol}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${position.side} ${position.position_side}`}
                            color={position.side === "BUY" ? "success" : "error"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {position.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            ${position.entry_price.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            ${position.mark_price.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            ${position.liquidation_price.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography 
                              variant="body2" 
                              color={position.unrealized_pnl >= 0 ? "success.main" : "error.main"}
                            >
                              ${position.unrealized_pnl.toFixed(2)}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color={position.pnl_percentage >= 0 ? "success.main" : "error.main"}
                            >
                              ({position.pnl_percentage.toFixed(2)}%)
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(position.timestamp).toLocaleString('vi-VN')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default memo(TradingAccountDetail, areEqual);
