import { memo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import type { TradingAccount } from "@/types/trading.types";
import { areEqual } from "@/utils/common";
import { useTranslation } from "react-i18next";

interface AccountBalanceTabProps {
  account: TradingAccount;
}

const AccountBalanceTab = ({ account }: AccountBalanceTabProps) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3 } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t("tradingAccount.detail.balance.title")}
      </Typography>
      
      {/* Summary Cards */}
      {account?.balance && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  {t("tradingAccount.detail.balance.totalWallet")}
                </Typography>
                <Typography variant="h6">
                  ${account.balance.total_wallet_balance.toFixed(8)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  {t("tradingAccount.detail.balance.available")}
                </Typography>
                <Typography variant="h6">
                  ${account.balance.available_balance.toFixed(8)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  {t("tradingAccount.detail.balance.unrealizedPnl")}
                </Typography>
                <Typography 
                  variant="h6"
                  color={account.balance.total_unrealized_pnl >= 0 ? "success.main" : "error.main"}
                >
                  ${account.balance.total_unrealized_pnl.toFixed(8)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  {t("tradingAccount.detail.balance.maxWithdraw")}
                </Typography>
                <Typography variant="h6">
                  ${account.balance.max_withdraw_amount.toFixed(8)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Assets Details */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t("tradingAccount.detail.balance.assetsTitle")}
      </Typography>
      
      {account?.balance?.assets && account.balance.assets.length > 0 ? (
        account.balance.assets.map((asset, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">{asset.asset}</Typography>
                <Chip 
                  label={asset.margin_available ? t("tradingAccount.detail.balance.marginAvailable") : t("tradingAccount.detail.balance.marginUnavailable")}
                  color={asset.margin_available ? "success" : "default"}
                  size="small"
                />
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {t("tradingAccount.detail.balance.asset.wallet")}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {asset.wallet_balance.toFixed(8)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {t("tradingAccount.detail.balance.asset.available")}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {asset.available_balance.toFixed(8)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {t("tradingAccount.detail.balance.asset.margin")}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {asset.margin_balance.toFixed(8)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {t("tradingAccount.detail.balance.asset.unrealizedPnl")}
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
                      {t("tradingAccount.detail.balance.asset.crossWallet")}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {asset.cross_wallet_balance.toFixed(8)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {t("tradingAccount.detail.balance.asset.updatedAt")}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(asset.update_time).toLocaleString()}
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
            {t("tradingAccount.detail.balance.noData")}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default memo(AccountBalanceTab, areEqual);
