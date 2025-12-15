import { useState, useEffect, useCallback, memo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Circle as CircleIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useNotification } from "@context/NotificationContext";
import { useTranslation } from "react-i18next";
import * as tradingProcessService from "@services/tradingProcess.service";
import type {
  TradingStateResponse,
  TradingCommandAction,
  TradingSide,
  QuantityType,
  TradingReason,
  CommandHistoryItem,
  PositionState,
} from "@/types/trading.types";

// Constants for dropdown options
const SIDE_OPTIONS: TradingSide[] = ["LONG", "SHORT"];
const QUANTITY_TYPE_OPTIONS: QuantityType[] = [
  "USDT",
  "QUANTITY",
  "USDT_PROFIT",
];
const REASON_OPTIONS: TradingReason[] = [
  "ENTRY",
  "ENTRY HEDGE",
  "EXIT",
  "EXIT TP2",
  "EXIT SL BREAKEVEN",
  "EXIT SL2",
  "EXIT HEDGE",
  "DCA",
  "CUTLOSS",
  "CUT LOSS HEDGE",
  "PLUS HEDGE",
  "MAX LOSS",
  "WIPED OUT",
];

// Reasons that trigger OPEN action
const OPEN_REASONS: TradingReason[] = [
  "ENTRY",
  "ENTRY HEDGE",
  "DCA",
  "PLUS HEDGE",
];

// Helper to determine action from reason
const getActionFromReason = (reason: TradingReason): TradingCommandAction => {
  return OPEN_REASONS.includes(reason) ? "OPEN" : "CLOSE";
};

interface TradingControlPanelProps {
  tradingId: string;
  isRunning: boolean;
}

const TradingControlPanel = ({
  tradingId,
  isRunning,
}: TradingControlPanelProps) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();

  // State
  const [tradingState, setTradingState] = useState<TradingStateResponse | null>(
    null
  );
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>(
    []
  );
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSendingCommand, setIsSendingCommand] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Command form state
  const [cmdSide, setCmdSide] = useState<TradingSide>("LONG");
  const [cmdQuantity, setCmdQuantity] = useState<string>("10");
  const [cmdQuantityType, setCmdQuantityType] = useState<QuantityType>("USDT");
  const [cmdReason, setCmdReason] = useState<TradingReason>("ENTRY");

  // Fetch trading state
  const fetchTradingState = useCallback(async () => {
    if (!tradingId || !isRunning) return;

    setIsLoadingState(true);
    setError(null);
    try {
      const state = await tradingProcessService.getTradingState(tradingId);
      setTradingState(state);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t("trading.control.errors.loadState");
      setError(message);
    } finally {
      setIsLoadingState(false);
    }
  }, [tradingId, isRunning, t]);

  // Fetch command history
  const fetchCommandHistory = useCallback(async () => {
    if (!tradingId) return;

    setIsLoadingHistory(true);
    try {
      const history = await tradingProcessService.getCommandHistory(
        tradingId,
        10
      );
      setCommandHistory(history);
    } catch (err) {
      console.error("Error fetching command history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [tradingId]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (isRunning) {
      fetchTradingState();
      fetchCommandHistory();

      // Auto-refresh every 5 seconds
      const interval = setInterval(() => {
        fetchTradingState();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isRunning, fetchTradingState, fetchCommandHistory]);

  // Send trading command
  const handleSendCommand = async () => {
    if (!tradingId) return;

    const action = getActionFromReason(cmdReason);

    // Validate quantity for OPEN action
    if (action === "OPEN") {
      const qty = parseFloat(cmdQuantity);
      if (isNaN(qty) || qty <= 0) {
        showNotification(t("trading.control.errors.invalidQuantity"), "error");
        return;
      }
    }

    setIsSendingCommand(true);
    try {
      const quantity = action === "OPEN" ? parseFloat(cmdQuantity) : null;
      const response = await tradingProcessService.sendTradingCommand(
        tradingId,
        {
          action,
          side: cmdSide,
          quantity,
          quantity_type: cmdQuantityType,
          reason: cmdReason,
        }
      );
      showNotification(
        t("trading.control.notifications.commandSent", {
          commandId: response.command_id,
        }),
        "success"
      );
      // Refresh history after sending command
      setTimeout(() => {
        fetchCommandHistory();
        fetchTradingState();
      }, 1000);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t("trading.control.errors.sendCommand");
      showNotification(message, "error");
    } finally {
      setIsSendingCommand(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Get status color
  const getCommandStatusColor = (status: string) => {
    switch (status) {
      case "EXECUTED":
        return "success";
      case "FAILED":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  // Render position card
  const renderPositionCard = (
    title: string,
    position: PositionState,
    side: TradingSide,
    color: string
  ) => {
    const hasPosition = position.quantity > 0;

    return (
      <Card
        sx={{
          height: "100%",
          borderLeft: `4px solid ${color}`,
          bgcolor: hasPosition ? `${color}08` : "background.paper",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" color={color}>
              {title}
            </Typography>
            {hasPosition && (
              <Chip
                size="small"
                label={t("trading.control.active")}
                color={side === "LONG" ? "success" : "error"}
              />
            )}
          </Box>

          <Grid container spacing={1}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                {t("trading.control.position.quantity")}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {position.quantity.toFixed(4)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                {t("trading.control.position.entryPrice")}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatCurrency(position.entry_price)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                {t("trading.control.position.unrealizedPnl")}
              </Typography>
              <Typography
                variant="body2"
                fontWeight="medium"
                color={
                  position.unrealized_pnl >= 0 ? "success.main" : "error.main"
                }
              >
                {formatCurrency(position.unrealized_pnl)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                {t("trading.control.position.roi")}
              </Typography>
              <Typography
                variant="body2"
                fontWeight="medium"
                color={position.roi >= 0 ? "success.main" : "error.main"}
              >
                {formatPercentage(position.roi)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                {t("trading.control.position.margin")}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatCurrency(position.margin)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                {t("trading.control.position.realizedPnl")}
              </Typography>
              <Typography
                variant="body2"
                fontWeight="medium"
                color={position.pnl >= 0 ? "success.main" : "error.main"}
              >
                {formatCurrency(position.pnl)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Calculate MDD vs Initial Balance
  const calculateMDD = () => {
    if (!tradingState || tradingState.initial_balance === 0) return 0;
    const drawdown = tradingState.initial_balance - tradingState.lowest_balance;
    return (drawdown / tradingState.initial_balance) * 100;
  };

  // Don't show panel if not running
  if (!isRunning) {
    return null;
  }

  return (
    <Paper
      elevation={3}
      sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, mb: 3, borderRadius: 2 }}
    >
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6">{t("trading.control.title")}</Typography>
          {tradingState && (
            <Chip
              size="small"
              icon={<CircleIcon sx={{ fontSize: "10px !important" }} />}
              label={
                tradingState.is_online
                  ? t("trading.control.online")
                  : t("trading.control.offline")
              }
              color={tradingState.is_online ? "success" : "error"}
            />
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {tradingState && (
            <Typography variant="body2" color="text.secondary">
              {tradingState.symbol} •{" "}
              {formatCurrency(tradingState.current_price)}
            </Typography>
          )}
          <Tooltip title={t("trading.control.actions.refresh")}>
            <IconButton
              onClick={fetchTradingState}
              disabled={isLoadingState}
              size="small"
            >
              {isLoadingState ? (
                <CircularProgress size={20} />
              ) : (
                <RefreshIcon />
              )}
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

      {/* Position Cards */}
      {tradingState && (
        <>
          {/* Balance & MDD Info */}
          <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Chip
              label={`${t("trading.control.balance.initial")}: ${formatCurrency(
                tradingState.initial_balance
              )}`}
              variant="outlined"
              size="small"
            />
            <Chip
              label={`${t("trading.control.balance.current")}: ${formatCurrency(
                tradingState.balance
              )}`}
              variant="outlined"
              size="small"
              color={
                tradingState.balance >= tradingState.initial_balance
                  ? "success"
                  : "error"
              }
            />
            <Chip
              label={`${t("trading.control.balance.lowest")}: ${formatCurrency(
                tradingState.lowest_balance
              )}`}
              variant="outlined"
              size="small"
              color="warning"
            />
            <Chip
              label={`MDD: ${calculateMDD().toFixed(2)}%`}
              variant="filled"
              size="small"
              color={
                calculateMDD() > 10
                  ? "error"
                  : calculateMDD() > 5
                  ? "warning"
                  : "success"
              }
            />
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderPositionCard(
                t("trading.control.position.long"),
                tradingState.long_position,
                "LONG",
                "#4caf50"
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              {renderPositionCard(
                t("trading.control.position.short"),
                tradingState.short_position,
                "SHORT",
                "#f44336"
              )}
            </Grid>
          </Grid>

          {/* Command Form */}
          <Box sx={{ mb: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              {t("trading.control.commandForm.title")}
            </Typography>
            <Grid container spacing={2} alignItems="center">
              {/* Side Select */}
              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>
                    {t("trading.control.commandForm.side")}
                  </InputLabel>
                  <Select
                    value={cmdSide}
                    label={t("trading.control.commandForm.side")}
                    onChange={(e) => setCmdSide(e.target.value as TradingSide)}
                  >
                    {SIDE_OPTIONS.map((side) => (
                      <MenuItem key={side} value={side}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          {side === "LONG" && (
                            <TrendingUpIcon fontSize="small" color="success" />
                          )}
                          {side === "SHORT" && (
                            <TrendingDownIcon fontSize="small" color="error" />
                          )}
                          {side}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Quantity Input - only shown for OPEN action */}
              {getActionFromReason(cmdReason) === "OPEN" && (
                <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                  <TextField
                    size="small"
                    label={t("trading.control.commandForm.quantity")}
                    type="number"
                    value={cmdQuantity}
                    onChange={(e) => setCmdQuantity(e.target.value)}
                    fullWidth
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            {cmdQuantityType === "USDT" ? "$" : ""}
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
              )}

              {/* Quantity Type Select */}
              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>
                    {t("trading.control.commandForm.quantityType")}
                  </InputLabel>
                  <Select
                    value={cmdQuantityType}
                    label={t("trading.control.commandForm.quantityType")}
                    onChange={(e) =>
                      setCmdQuantityType(e.target.value as QuantityType)
                    }
                  >
                    {QUANTITY_TYPE_OPTIONS.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Reason Select */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>
                    {t("trading.control.commandForm.reason")}
                  </InputLabel>
                  <Select
                    value={cmdReason}
                    label={t("trading.control.commandForm.reason")}
                    onChange={(e) =>
                      setCmdReason(e.target.value as TradingReason)
                    }
                  >
                    {REASON_OPTIONS.map((reason) => (
                      <MenuItem key={reason} value={reason}>
                        {reason}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Send Button */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Button
                  variant="contained"
                  color={
                    getActionFromReason(cmdReason) === "OPEN"
                      ? cmdSide === "LONG"
                        ? "success"
                        : "error"
                      : "warning"
                  }
                  onClick={handleSendCommand}
                  disabled={isSendingCommand}
                  startIcon={
                    isSendingCommand ? (
                      <CircularProgress size={16} />
                    ) : (
                      <SendIcon />
                    )
                  }
                  fullWidth
                >
                  {t("trading.control.commandForm.send")}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </>
      )}

      {/* Command History */}
      <Box>
        <Button
          onClick={() => setHistoryExpanded(!historyExpanded)}
          endIcon={historyExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ mb: 1 }}
        >
          {t("trading.control.history.title")} ({commandHistory.length})
        </Button>
        <Collapse in={historyExpanded}>
          {isLoadingHistory ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : commandHistory.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 2, textAlign: "center" }}
            >
              {t("trading.control.history.empty")}
            </Typography>
          ) : (
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("trading.control.history.time")}</TableCell>
                    <TableCell>{t("trading.control.history.action")}</TableCell>
                    <TableCell>{t("trading.control.history.side")}</TableCell>
                    <TableCell>
                      {t("trading.control.history.quantity")}
                    </TableCell>
                    <TableCell>{t("trading.control.history.status")}</TableCell>
                    <TableCell>{t("trading.control.history.reason")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {commandHistory.map((cmd) => (
                    <TableRow key={cmd.command_id}>
                      <TableCell>{formatTimestamp(cmd.created_at)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={cmd.action}
                          color={
                            cmd.action === "OPEN"
                              ? "primary"
                              : cmd.action === "CLOSE_ALL"
                              ? "error"
                              : "warning"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={cmd.side}
                          color={
                            cmd.side === "LONG"
                              ? "success"
                              : cmd.side === "SHORT"
                              ? "error"
                              : "default"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{cmd.quantity ?? "-"}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={cmd.status}
                          color={
                            getCommandStatusColor(cmd.status) as
                              | "success"
                              | "error"
                              | "warning"
                              | "default"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{ maxWidth: 100, display: "block" }}
                        >
                          {cmd.reason}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Collapse>
      </Box>
    </Paper>
  );
};

export default memo(TradingControlPanel);
