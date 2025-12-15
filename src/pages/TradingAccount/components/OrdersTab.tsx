import { useState, useCallback, useEffect, memo } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Button,
  Alert,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  DeleteSweep as DeleteSweepIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import type { OpenOrderInfo, OpenOrdersResponse } from "@/types/trading.types";

interface OrdersTabProps {
  accountId: string;
  onGetOrders: (symbol?: string) => Promise<OpenOrdersResponse>;
  onCancelOrder: (orderId: number, symbol: string) => Promise<void>;
  onCancelAllOrders: (symbol: string) => Promise<void>;
}

const OrdersTab = ({
  accountId,
  onGetOrders,
  onCancelOrder,
  onCancelAllOrders,
}: OrdersTabProps) => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<OpenOrderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symbolFilter, setSymbolFilter] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(
    null
  );
  const [cancellingSymbol, setCancellingSymbol] = useState<string | null>(null);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await onGetOrders(symbolFilter || undefined);
      setOrders(response.orders || []);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t("tradingAccount.orders.errors.load");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [onGetOrders, symbolFilter, t]);

  // Initial fetch
  useEffect(() => {
    if (accountId) {
      fetchOrders();
    }
  }, [accountId, fetchOrders]);

  // Handle cancel single order
  const handleCancelOrder = async (orderId: number, symbol: string) => {
    setCancellingOrderId(orderId);
    try {
      await onCancelOrder(orderId, symbol);
      await fetchOrders();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t("tradingAccount.orders.errors.cancel");
      setError(message);
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Handle cancel all orders for a symbol
  const handleCancelAllOrders = async (symbol: string) => {
    setCancellingSymbol(symbol);
    try {
      await onCancelAllOrders(symbol);
      await fetchOrders();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t("tradingAccount.orders.errors.cancelAll");
      setError(message);
    } finally {
      setCancellingSymbol(null);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get order type color
  const getOrderTypeColor = (type: string) => {
    if (type.includes("TAKE_PROFIT")) return "success";
    if (type.includes("STOP")) return "error";
    if (type === "LIMIT") return "info";
    return "default";
  };

  // Get unique symbols from orders
  const uniqueSymbols = [...new Set(orders.map((o) => o.symbol))];

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="h6">
          {t("tradingAccount.orders.title")} ({orders.length})
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder={t("tradingAccount.orders.filterSymbol")}
            value={symbolFilter}
            onChange={(e) => setSymbolFilter(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 180 }}
          />
          <Tooltip title={t("tradingAccount.orders.refresh")}>
            <IconButton onClick={fetchOrders} disabled={isLoading}>
              {isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Cancel All Buttons by Symbol */}
      {uniqueSymbols.length > 0 && (
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {uniqueSymbols.map((symbol) => (
            <Button
              key={symbol}
              size="small"
              variant="outlined"
              color="error"
              startIcon={
                cancellingSymbol === symbol ? (
                  <CircularProgress size={14} />
                ) : (
                  <DeleteSweepIcon />
                )
              }
              onClick={() => handleCancelAllOrders(symbol)}
              disabled={cancellingSymbol !== null}
            >
              {t("tradingAccount.orders.cancelAll")} {symbol}
            </Button>
          ))}
        </Box>
      )}

      {/* Orders Table */}
      {isLoading && orders.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 4 }}
        >
          {t("tradingAccount.orders.empty")}
        </Typography>
      ) : (
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t("tradingAccount.orders.table.symbol")}</TableCell>
                <TableCell>{t("tradingAccount.orders.table.type")}</TableCell>
                <TableCell>{t("tradingAccount.orders.table.side")}</TableCell>
                <TableCell>
                  {t("tradingAccount.orders.table.positionSide")}
                </TableCell>
                <TableCell align="right">
                  {t("tradingAccount.orders.table.quantity")}
                </TableCell>
                <TableCell align="right">
                  {t("tradingAccount.orders.table.stopPrice")}
                </TableCell>
                <TableCell>{t("tradingAccount.orders.table.status")}</TableCell>
                <TableCell>{t("tradingAccount.orders.table.time")}</TableCell>
                <TableCell align="center">
                  {t("tradingAccount.orders.table.actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.order_id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {order.symbol}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={order.type.replace(/_/g, " ")}
                      color={
                        getOrderTypeColor(order.type) as
                          | "success"
                          | "error"
                          | "info"
                          | "default"
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={order.side}
                      color={order.side === "BUY" ? "success" : "error"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={order.position_side}
                      color={
                        order.position_side === "LONG"
                          ? "success"
                          : order.position_side === "SHORT"
                          ? "error"
                          : "default"
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">{order.orig_quantity}</TableCell>
                  <TableCell align="right">
                    {order.stop_price
                      ? `$${order.stop_price.toLocaleString()}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={order.status}
                      color={
                        order.status === "NEW"
                          ? "primary"
                          : order.status === "PARTIALLY_FILLED"
                          ? "warning"
                          : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {formatTime(order.create_time)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={t("tradingAccount.orders.cancelOrder")}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          handleCancelOrder(order.order_id, order.symbol)
                        }
                        disabled={cancellingOrderId === order.order_id}
                      >
                        {cancellingOrderId === order.order_id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <CancelIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default memo(OrdersTab);
