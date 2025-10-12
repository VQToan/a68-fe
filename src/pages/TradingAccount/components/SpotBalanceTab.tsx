import { memo, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Button,
  Chip,
} from "@mui/material";
import type { SpotBalanceResponse } from "@/types/trading.types";
import { areEqual } from "@/utils/common";
import { useTranslation } from "react-i18next";

interface SpotBalanceTabProps {
  data: SpotBalanceResponse | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const SpotBalanceTab = ({ data, isLoading, error, onRetry }: SpotBalanceTabProps) => {
  const { t } = useTranslation();

  const balances = useMemo(() => {
    if (!data?.balances) return [];
    return [...data.balances].sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
  }, [data]);

  const formattedUpdateTime = data?.update_time
    ? new Date(data.update_time).toLocaleString()
    : null;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 240 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
        {onRetry && (
          <Button variant="outlined" onClick={onRetry}>
            {t("tradingAccount.detail.spot.retry")}
          </Button>
        )}
      </Box>
    );
  }

  if (!balances.length) {
    return (
      <Box sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="body1" color="textSecondary">
          {t("tradingAccount.detail.spot.noData")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: 3 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                {t("tradingAccount.detail.spot.totalUsdt")}
              </Typography>
              <Typography variant="h6">
                ${(data?.total_balance_usdt ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                {t("tradingAccount.detail.spot.totalBtc")}
              </Typography>
              <Typography variant="h6">
                {(data?.total_balance_btc ?? 0).toLocaleString(undefined, { maximumFractionDigits: 8 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" color="textSecondary">
                {t("tradingAccount.detail.spot.updatedAt")}
              </Typography>
              {formattedUpdateTime ? (
                <Chip
                  label={formattedUpdateTime}
                  size="small"
                  color="info"
                  sx={{ alignSelf: "flex-start" }}
                />
              ) : (
                <Typography variant="body1" fontWeight="medium">
                  {t("tradingAccount.detail.spot.never")}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("tradingAccount.detail.spot.table.asset")}</TableCell>
              <TableCell align="right">{t("tradingAccount.detail.spot.table.free")}</TableCell>
              <TableCell align="right">{t("tradingAccount.detail.spot.table.locked")}</TableCell>
              <TableCell align="right">{t("tradingAccount.detail.spot.table.total")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {balances.map((balance) => (
              <TableRow key={balance.asset} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {balance.asset}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {balance.free.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                </TableCell>
                <TableCell align="right">
                  {balance.locked.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                </TableCell>
                <TableCell align="right">
                  {balance.total.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default memo(SpotBalanceTab, areEqual);
