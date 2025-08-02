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
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  AccountBalance as BalanceIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  ClearAll as ClearAllIcon,
  RemoveCircle as RemoveCircleIcon,
} from "@mui/icons-material";
import { useTradingAccount } from "@hooks/useTradingAccount";
import { useTradingProcess } from "@hooks/useTradingProcess";
import { useNotification } from "@context/NotificationContext";
import { useNavigate, useParams } from "react-router-dom";
import type { TradingProcess } from "@/types/trading.types";
import { areEqual } from "@/utils/common";

// Mock data interfaces for balance and open orders
interface AccountBalance {
  asset: string;
  free: string;
  locked: string;
  total: string;
}

interface OpenOrder {
  orderId: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: string;
  quantity: string;
  price: string;
  liquid: string;
  time: string;
}

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
  
  // Hooks
  const {
    currentAccount,
    isLoading: isLoadingAccount,
    error: accountError,
    getAccountById,
    clearError: clearAccountError,
  } = useTradingAccount();

  const {
    processes,
    isLoading: isLoadingProcesses,
    error: processError,
    getProcesses,
    clearError: clearProcessError,
  } = useTradingProcess();

  // Local state
  const [currentTab, setCurrentTab] = useState<string>("balance");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // State for order dialogs
  const [openNewOrderDialog, setOpenNewOrderDialog] = useState<boolean>(false);
  const [openCloseOrderDialog, setOpenCloseOrderDialog] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<OpenOrder | null>(null);
  const [closeOrderType, setCloseOrderType] = useState<"full" | "partial">("full");
  const [partialQuantity, setPartialQuantity] = useState<string>("");

  // Mock data - in real app, these would come from API
  const [accountBalance] = useState<AccountBalance[]>([
    { asset: "USDT", free: "1,250.00", locked: "750.00", total: "2,000.00" },
    { asset: "BTC", free: "0.05", locked: "0.02", total: "0.07" },
    { asset: "ETH", free: "2.15", locked: "0.85", total: "3.00" },
  ]);

  const [openOrders] = useState<OpenOrder[]>([
    {
      orderId: "12345678",
      symbol: "BTCUSDT",
      side: "BUY",
      type: "LIMIT",
      quantity: "0.01",
      price: "45,000.00",
      liquid: "450.00",
      time: "2025-01-15 10:30:00",
    },
    {
      orderId: "12345679",
      symbol: "ETHUSDT",
      side: "SELL",
      type: "LIMIT",
      quantity: "0.5",
      price: "3,200.00",
      liquid: "1,600.00",
      time: "2025-01-15 09:15:00",
    },
  ]);

  // Fetch account details on mount
  useEffect(() => {
    if (id) {
      fetchAccountDetails();
    }
  }, [id]);

  // Fetch trading processes for this account
  useEffect(() => {
    if (id) {
      fetchTradingProcesses();
    }
  }, [id]);

  // Handle errors
  useEffect(() => {
    if (accountError) {
      showNotification(accountError, "error");
      clearAccountError();
    }
  }, [accountError, showNotification, clearAccountError]);

  useEffect(() => {
    if (processError) {
      showNotification(processError, "error");
      clearProcessError();
    }
  }, [processError, showNotification, clearProcessError]);

  // Fetch account details
  const fetchAccountDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      await getAccountById(id);
    } catch (error) {
      console.error("Error fetching account details:", error);
    }
  }, [id, getAccountById]);

  // Fetch trading processes
  const fetchTradingProcesses = useCallback(async () => {
    if (!id) return;
    
    try {
      await getProcesses(undefined, 0, 100); // Fetch all processes (will filter by account on backend)
    } catch (error) {
      console.error("Error fetching trading processes:", error);
    }
  }, [id, getProcesses]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchAccountDetails(),
      fetchTradingProcesses(),
    ]);
    setIsRefreshing(false);
    showNotification("Dữ liệu đã được cập nhật", "success");
  }, [fetchAccountDetails, fetchTradingProcesses, showNotification]);

  // Handle view trading process detail
  const handleViewTradingProcess = useCallback((processId: string) => {
    navigate(`/trading-process/${processId}`);
  }, [navigate]);

  // Format exchange name
  const getExchangeDisplayName = (exchange: string) => {
    const exchangeNames: Record<string, string> = {
      binance: "Binance",
      bybit: "Bybit",
      okx: "OKX",
      bitget: "Bitget",
    };
    return exchangeNames[exchange] || exchange.toUpperCase();
  };

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

  if (!currentAccount && !isLoadingAccount) {
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
              {currentAccount && (
                <Chip 
                  label={currentAccount.is_active ? "Hoạt động" : "Không hoạt động"}
                  color={currentAccount.is_active ? "success" : "default"}
                  size="small"
                />
              )}
            </Box>
            {currentAccount && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {currentAccount.account_name} • {getExchangeDisplayName(currentAccount.exchange)}
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: "auto" }}>
            <Box sx={{ display: "flex", gap: 1 }}>
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
      </Paper>

      {/* Content */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="account detail tabs"
          >
            <Tab 
              label="Balance" 
              value="balance" 
              icon={<BalanceIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Lệnh đang mở" 
              value="orders" 
              icon={<ScheduleIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Trading Process" 
              value="processes" 
              icon={<TrendingUpIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Balance Tab */}
        <TabPanel value={currentTab} index="balance">
          <Grid container spacing={3}>
            {accountBalance.map((balance, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      {balance.asset}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Có sẵn
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {balance.free}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Đang khóa
                      </Typography>
                      <Typography variant="body1" color="warning.main">
                        {balance.locked}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Tổng cộng
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        {balance.total}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Open Orders Tab */}
        <TabPanel value={currentTab} index="orders">
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewOrderDialog(true)}
            >
              Mở lệnh mới
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã lệnh</TableCell>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Giá</TableCell>
                  <TableCell>Liquid</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {openOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="textSecondary">
                        Không có lệnh đang mở
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  openOrders.map((order, index) => (
                    <TableRow key={index}>
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>{order.symbol}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.side}
                          color={order.side === "BUY" ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>${order.price}</TableCell>
                      <TableCell>${order.liquid}</TableCell>
                      <TableCell>{order.time}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Tooltip title="Đóng toàn bộ">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedOrder(order);
                                setCloseOrderType("full");
                                setOpenCloseOrderDialog(true);
                              }}
                            >
                              <ClearAllIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Đóng 1 phần">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => {
                                setSelectedOrder(order);
                                setCloseOrderType("partial");
                                setOpenCloseOrderDialog(true);
                              }}
                            >
                              <RemoveCircleIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Trading Processes Tab */}
        <TabPanel value={currentTab} index="processes">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên Process</TableCell>
                  <TableCell>Bot Template</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingProcesses ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="textSecondary">
                        Đang tải...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : processes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="textSecondary">
                        Không có trading process nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  processes.map((process: TradingProcess) => (
                    <TableRow key={process._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {process.name}
                        </Typography>
                        {process.description && (
                          <Typography variant="caption" color="textSecondary">
                            {process.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {process.bot_template_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusDisplayText(process.status)}
                          color={getStatusColor(process.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(process.created_at).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            onClick={() => handleViewTradingProcess(process._id)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* New Order Dialog */}
      <Dialog 
        open={openNewOrderDialog} 
        onClose={() => setOpenNewOrderDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mở lệnh mới</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Symbol</InputLabel>
              <Select label="Symbol">
                <MenuItem value="BTCUSDT">BTCUSDT</MenuItem>
                <MenuItem value="ETHUSDT">ETHUSDT</MenuItem>
                <MenuItem value="BNBUSDT">BNBUSDT</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Loại lệnh</InputLabel>
              <Select label="Loại lệnh">
                <MenuItem value="BUY">BUY</MenuItem>
                <MenuItem value="SELL">SELL</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Kiểu lệnh</InputLabel>
              <Select label="Kiểu lệnh">
                <MenuItem value="MARKET">MARKET</MenuItem>
                <MenuItem value="LIMIT">LIMIT</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Số lượng"
              type="number"
              placeholder="0.01"
            />

            <TextField
              fullWidth
              label="Giá"
              type="number"
              placeholder="45000"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewOrderDialog(false)}>
            Hủy
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              setOpenNewOrderDialog(false);
              showNotification("Lệnh đã được tạo thành công", "success");
            }}
          >
            Tạo lệnh
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Order Dialog */}
      <Dialog 
        open={openCloseOrderDialog} 
        onClose={() => setOpenCloseOrderDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {closeOrderType === "full" ? "Đóng toàn bộ lệnh" : "Đóng 1 phần lệnh"}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Mã lệnh:</strong> {selectedOrder.orderId}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Symbol:</strong> {selectedOrder.symbol}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Số lượng hiện tại:</strong> {selectedOrder.quantity}
              </Typography>
              
              {closeOrderType === "partial" && (
                <TextField
                  fullWidth
                  label="Số lượng muốn đóng"
                  type="number"
                  value={partialQuantity}
                  onChange={(e) => setPartialQuantity(e.target.value)}
                  sx={{ mt: 2 }}
                  placeholder="0.005"
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCloseOrderDialog(false)}>
            Hủy
          </Button>
          <Button 
            variant="contained"
            color="error"
            onClick={() => {
              setOpenCloseOrderDialog(false);
              const message = closeOrderType === "full" 
                ? "Lệnh đã được đóng hoàn toàn" 
                : `Đã đóng ${partialQuantity} từ lệnh ${selectedOrder?.orderId}`;
              showNotification(message, "success");
              setPartialQuantity("");
              setSelectedOrder(null);
            }}
          >
            {closeOrderType === "full" ? "Đóng toàn bộ" : "Đóng 1 phần"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default memo(TradingAccountDetail, areEqual);
