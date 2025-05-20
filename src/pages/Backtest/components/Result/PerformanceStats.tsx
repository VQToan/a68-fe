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

interface PerformanceStatsProps {
  metrics: BacktestResultMetrics;
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({
  metrics,
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Thống kê hiệu suất
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
          <Typography variant="body2">Tổng lợi nhuận (PnL)</Typography>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {formatNumber(metrics.total_pnl || 0)} USDT
          </Typography>
        </Box>

        {/* Thống kê giao dịch */}
        <Typography
          variant="subtitle2"
          sx={{ mt: 2, mb: 1, fontWeight: "bold" }}
        >
          Thống kê giao dịch
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              Tổng số giao dịch
            </Typography>
            <Typography variant="h6">{metrics.total_trades || 0}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              GD/tháng
            </Typography>
            <Typography variant="h6">
              {formatNumber(metrics.monthly_trades || 0)}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              Giao dịch LONG
            </Typography>
            <Typography variant="h6">{metrics.long_trades || 0}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              Giao dịch SHORT
            </Typography>
            <Typography variant="h6">{metrics.short_trades || 0}</Typography>
          </Grid>
        </Grid>

        {/* Tỉ lệ thắng/thua */}
        <Typography
          variant="subtitle2"
          sx={{ mt: 2, mb: 1, fontWeight: "bold" }}
        >
          Tỉ lệ thắng/thua
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              Tỷ lệ thắng
            </Typography>
            <Typography variant="h6">
              {formatNumber(metrics.win_rate || 0)}%
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              Tỷ lệ thắng LONG
            </Typography>
            <Typography variant="h6">
              {formatNumber(metrics.long_win_rate || 0)}%
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              Giao dịch thắng
            </Typography>
            <Typography variant="h6" color="success.main">
              {metrics.winning_trades || 0}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              Tỷ lệ thắng SHORT
            </Typography>
            <Typography variant="h6">
              {formatNumber(metrics.short_win_rate || 0)}%
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              Giao dịch thua
            </Typography>
            <Typography variant="h6" color="error.main">
              {metrics.losing_trades || 0}
            </Typography>
          </Grid>
        </Grid>

        {/* Metrics PnL */}
        <Typography
          variant="subtitle2"
          sx={{ mt: 2, mb: 1, fontWeight: "bold" }}
        >
          Metrics PnL
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              PnL/tháng
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
              PnL/giao dịch
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
              PnL LONG TB
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
              PnL SHORT TB
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

        {/* Metrics ROI */}
        <Typography
          variant="subtitle2"
          sx={{ mt: 2, mb: 1, fontWeight: "bold" }}
        >
          Metrics ROI
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              Tổng ROI
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
              ROI/tháng
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
              ROI LONG TB
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
              ROI SHORT TB
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

        {/* Chỉ số rủi ro */}
        <Typography
          variant="subtitle2"
          sx={{ mt: 2, mb: 1, fontWeight: "bold" }}
        >
          Chỉ số rủi ro
        </Typography>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              Max Drawdown
            </Typography>
            <Typography variant="h6" color="error.main">
              {formatNumber(metrics.mdd || 0)}%
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              Sharpe Ratio
            </Typography>
            <Typography variant="h6">
              {formatNumber(metrics.sharpe_ratio || 0)}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              Profit Factor
            </Typography>
            <Typography variant="h6">
              {formatNumber(metrics.profit_factor || 0)}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2" color="text.secondary">
              Max Loss
            </Typography>
            <Typography variant="h6">
              {metrics.max_loss_occurrences || 0}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default memo(PerformanceStats, areEqual);
