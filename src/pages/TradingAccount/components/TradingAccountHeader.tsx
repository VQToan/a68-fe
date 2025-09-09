import { memo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import type { TradingAccount, AccountStatusType } from "@/types/trading.types";
import { areEqual } from "@/utils/common";

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

interface TradingAccountHeaderProps {
  account?: TradingAccount;
  onBack: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const TradingAccountHeader = ({
  account,
  onBack,
  onRefresh,
  isRefreshing,
}: TradingAccountHeaderProps) => {
  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3, overflow: 'hidden', borderRadius: 2 }}>
      <Grid container spacing={2} alignItems="center" justifyContent="space-between">
        <Grid size={{ xs: 12, md: 'auto' }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h5" component="h1">
              Chi tiết Tài khoản Trading
            </Typography>
            {account && (
              <Chip 
                label={getStatusLabel(account.status)}
                color={getStatusColor(account.status)}
                size="small"
              />
            )}
          </Box>
          {account && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {account.account_name} • {getExchangeDisplayName(account.exchange)}
            </Typography>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 'auto' }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
            >
              Quay lại
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? "Đang làm mới..." : "Làm mới"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default memo(TradingAccountHeader, areEqual);
