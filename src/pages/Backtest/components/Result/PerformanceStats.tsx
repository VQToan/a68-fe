import React, { memo } from "react";
import {
  Box,
  Typography,
  Divider,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { formatNumber } from "@utils/common";
import { areEqual } from "@/utils/common";
import type { BacktestResultMetrics } from "@/types/backtestResult.type";
import { useTranslation } from "react-i18next";

interface PerformanceStatsProps {
  metrics: BacktestResultMetrics;
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({ metrics }) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t("backtest.results.performance.title")}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box
          sx={{
            bgcolor:
              (metrics?.total_pnl || 0) >= 0 ? "success.main" : "error.main",
            color: "white",
            p: 2,
            borderRadius: 1,
            mb: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="body2">
            {t("backtest.results.performance.totalPnl")}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {formatNumber(metrics.total_pnl || 0)} USDT
          </Typography>
        </Box>

        <Typography
          variant="subtitle2"
          sx={{ mt: 2, mb: 1, fontWeight: "bold" }}
        >
          {t("backtest.results.performance.tradeStats.title")}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.tradeStats.totalTrades")}
            </Typography>
            <Typography variant="h6">{metrics.total_trades || 0}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.tradeStats.monthlyTrades")}
            </Typography>
            <Typography variant="h6">
              {formatNumber(metrics.monthly_trades || 0)}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.tradeStats.longTrades")}
            </Typography>
            <Typography variant="h6">{metrics.long_trades || 0}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.tradeStats.shortTrades")}
            </Typography>
            <Typography variant="h6">{metrics.short_trades || 0}</Typography>
          </Grid>
          {/* total_orders */}
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.tradeStats.totalOrders")}
            </Typography>
            <Typography variant="h6">{metrics.total_orders || 0}</Typography>
          </Grid>
          {/* volume_orders */}
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.tradeStats.orderVolume")}
            </Typography>
            <Typography variant="h6">
              {formatNumber(metrics.volume_orders || 0)}
            </Typography>
          </Grid>
        </Grid>

        <Typography
          variant="subtitle2"
          sx={{ mt: 2, mb: 1, fontWeight: "bold" }}
        >
          {t("backtest.results.performance.winLoss.title")}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.winLoss.winRate")}
            </Typography>
            <Typography variant="h6">
              {formatNumber(metrics.win_rate || 0)}%
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.winLoss.longWinRate")}
            </Typography>
            <Typography variant="h6">
              {formatNumber(metrics.long_win_rate || 0)}%
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.winLoss.winningTrades")}
            </Typography>
            <Typography variant="h6" color="success.main">
              {metrics.winning_trades || 0}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.winLoss.shortWinRate")}
            </Typography>
            <Typography variant="h6">
              {formatNumber(metrics.short_win_rate || 0)}%
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.winLoss.losingTrades")}
            </Typography>
            <Typography variant="h6" color="error.main">
              {metrics.losing_trades || 0}
            </Typography>
          </Grid>
        </Grid>

        <Typography
          variant="subtitle2"
          sx={{ mt: 2, mb: 1, fontWeight: "bold" }}
        >
          {t("backtest.results.performance.pnl.title")}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.pnl.monthlyPnl")}
            </Typography>
            <Typography
              variant="h6"
              color={
                (metrics.monthly_pnl || 0) >= 0 ? "success.main" : "error.main"
              }
            >
              {formatNumber(metrics.monthly_pnl || 0)}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.pnl.perTrade")}
            </Typography>
            <Typography
              variant="h6"
              color={
                (metrics.avg_pnl_per_trade || 0) >= 0
                  ? "success.main"
                  : "error.main"
              }
            >
              {formatNumber(metrics.avg_pnl_per_trade || 0)}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.pnl.avgLong")}
            </Typography>
            <Typography
              variant="h6"
              color={
                (metrics.avg_long_pnl || 0) >= 0 ? "success.main" : "error.main"
              }
            >
              {formatNumber(metrics.avg_long_pnl || 0)}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.pnl.avgShort")}
            </Typography>
            <Typography
              variant="h6"
              color={
                (metrics.avg_short_pnl || 0) >= 0
                  ? "success.main"
                  : "error.main"
              }
            >
              {formatNumber(metrics.avg_short_pnl || 0)}
            </Typography>
          </Grid>
        </Grid>

        <Typography
          variant="subtitle2"
          sx={{ mt: 2, mb: 1, fontWeight: "bold" }}
        >
          {t("backtest.results.performance.roi.title")}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.roi.total")}
            </Typography>
            <Typography
              variant="h6"
              color={
                (metrics.total_roi || 0) >= 0 ? "success.main" : "error.main"
              }
            >
              {formatNumber(metrics.total_roi || 0)}%
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.roi.monthly")}
            </Typography>
            <Typography
              variant="h6"
              color={
                (metrics.monthly_roi || 0) >= 0 ? "success.main" : "error.main"
              }
            >
              {formatNumber(metrics.monthly_roi || 0)}%
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.roi.avgLong")}
            </Typography>
            <Typography
              variant="h6"
              color={
                (metrics.avg_long_roi || 0) >= 0 ? "success.main" : "error.main"
              }
            >
              {formatNumber(metrics.avg_long_roi || 0)}%
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.roi.avgShort")}
            </Typography>
            <Typography
              variant="h6"
              color={
                (metrics.avg_short_roi || 0) >= 0
                  ? "success.main"
                  : "error.main"
              }
            >
              {formatNumber(metrics.avg_short_roi || 0)}%
            </Typography>
          </Grid>
        </Grid>

        <Typography
          variant="subtitle2"
          sx={{ mt: 2, mb: 1, fontWeight: "bold" }}
        >
          {t("backtest.results.performance.risk.title")}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.risk.maxDrawdown")}
            </Typography>
            <Typography variant="h6" color="error.main">
              {formatNumber(metrics.mdd || 0)}%
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.risk.sharpeRatio")}
            </Typography>
            <Typography variant="h6">
              {formatNumber(metrics.sharpe_ratio || 0)}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.risk.profitFactor")}
            </Typography>
            <Typography variant="h6">
              {formatNumber(metrics.profit_factor || 0)}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.risk.maxLoss")}
            </Typography>
            <Typography variant="h6">
              {metrics.max_loss_occurrences || 0}
            </Typography>
          </Grid>
          {/* mdd_org_balance */}
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              {t("backtest.results.performance.risk.mddOriginalBalance")}
            </Typography>
            <Typography variant="h6" color="error.main">
              {formatNumber(metrics.mdd_org_balance || 0)}%
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default memo(PerformanceStats, areEqual);
