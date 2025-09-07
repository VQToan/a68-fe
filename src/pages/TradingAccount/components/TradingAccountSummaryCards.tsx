import { memo } from "react";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
} from "@mui/material";
import {
  AccountBalance as BalanceIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import type { DashboardData } from "@/types/trading.types";
import { areEqual } from "@/utils/common";

interface TradingAccountSummaryCardsProps {
  dashboardData: DashboardData;
}

const TradingAccountSummaryCards = ({ dashboardData }: TradingAccountSummaryCardsProps) => {
  const { account_info, total_balance_usd, total_pnl, positions_count } = dashboardData;

  return (
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
  );
};

export default memo(TradingAccountSummaryCards, areEqual);
