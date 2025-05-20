import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import PerformanceStats from "./PerformanceStats";
import { formatDate, formatNumber, areEqual } from "@/utils/common";
import type {
  BacktestTrade,
} from "@/services/backtest.service";
import { useBacktestResult } from "@/hooks/useBacktestResult";


interface ResultViewProps {
  selectedResultId: string;
  symbol: string;
  initialInterval?: string;
}

const ResultView: React.FC<ResultViewProps> = ({
  selectedResultId,
}) => {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsHeight, setStatsHeight] = useState<number>(0);

  const { getResultDetail, loading: loadingDetail, resultDetails } = useBacktestResult();

  const resultDetail = useMemo(
    () => resultDetails[selectedResultId],
    [resultDetails, selectedResultId]
  );

  const metrics = useMemo(
    () => resultDetail?.metrics || ({}),
    [resultDetail]
  );

  const trades = useMemo(
    () => resultDetail?.trades || ([] as BacktestTrade[]),
    [resultDetail]
  );

  // Update statsHeight when the component mounts or when the content changes
  useEffect(() => {
    const updateHeight = () => {
      if (statsRef.current) {
        // Get the height of the PerformanceStats component
        const height = statsRef.current.getBoundingClientRect().height;
        setStatsHeight(height - 24); // Subtracting padding
      }
    };

    // Initial update
    updateHeight();

    // Update on window resize
    window.addEventListener("resize", updateHeight);

    // Update after a short delay to ensure content is rendered
    const timer = setTimeout(updateHeight, 500);

    return () => {
      window.removeEventListener("resize", updateHeight);
      clearTimeout(timer);
    };
  }, [resultDetail, metrics]);

  useEffect(() => {
    if (selectedResultId) {
      getResultDetail(selectedResultId);
    }
  }, [selectedResultId]);

  // Show loading rows count
  const skeletonRowCount = 10;

  return (
    <>
      <Divider sx={{ my: 3 }} />

      {/* Chart */}
      {/* <Grid container spacing={3} mb={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Biểu đồ giao dịch</Typography>
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <InputLabel id="interval-select-label">
                    Khung thời gian
                  </InputLabel>
                  <Select
                    labelId="interval-select-label"
                    id="interval-select"
                    value={selectedInterval}
                    onChange={handleIntervalChange}
                    label="Khung thời gian"
                  >
                    {INTERVALS.map((interval) => (
                      <MenuItem key={interval} value={interval}>
                        {interval}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ height: 500, width: "100%" }}>
                <BacktestChart
                  trades={trades}
                  symbol={symbol}
                  interval={selectedInterval}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid> */}

      {/* Performance Stats and Trade List */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box ref={statsRef}>
            <PerformanceStats metrics={metrics} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: statsHeight > 0 ? `${statsHeight}px` : "auto" }}>
            <CardContent
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Danh sách giao dịch</Typography>
                {loadingDetail ? (
                  <Skeleton variant="text" width={100} />
                ) : (
                  <Typography variant="subtitle1" fontWeight="medium">
                    Tổng số: <strong>{trades.length}</strong> giao dịch
                  </Typography>
                )}
              </Box>
              <TableContainer
                component={Paper}
                sx={{
                  flex: 1,
                  maxHeight:
                    statsHeight > 0 ? `calc(${statsHeight}px - 60px)` : "500px",
                  overflow: "auto",
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="body2" fontWeight="bold">
                            Chi tiết giao dịch
                          </Typography>
                          <Box>
                            {loadingDetail ? (
                              <Box display="flex" gap={1}>
                                <Skeleton variant="rounded" width={70} height={24} />
                                <Skeleton variant="rounded" width={70} height={24} />
                              </Box>
                            ) : (
                              <>
                                <Chip
                                  size="small"
                                  color="success"
                                  sx={{ mr: 1 }}
                                  label={`LONG: ${
                                    trades.filter((t) => t.side.includes("LONG"))
                                      .length
                                  }`}
                                />
                                <Chip
                                  size="small"
                                  color="error"
                                  label={`SHORT: ${
                                    trades.filter((t) => t.side.includes("SHORT"))
                                      .length
                                  }`}
                                />
                              </>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Thời gian</TableCell>
                      <TableCell>Loại</TableCell>
                      <TableCell>Giá</TableCell>
                      <TableCell>Số lượng</TableCell>
                      <TableCell>Lý do</TableCell>
                      <TableCell>Order PnL</TableCell>
                      <TableCell>Transaction PnL</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingDetail ? (
                      // Show loading skeleton rows
                      Array(skeletonRowCount).fill(0).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell><Skeleton variant="text" /></TableCell>
                          <TableCell><Skeleton variant="rounded" width={70} height={24} /></TableCell>
                          <TableCell><Skeleton variant="text" /></TableCell>
                          <TableCell><Skeleton variant="text" width={40} /></TableCell>
                          <TableCell><Skeleton variant="text" /></TableCell>
                          <TableCell><Skeleton variant="text" /></TableCell>
                          <TableCell><Skeleton variant="text" /></TableCell>
                        </TableRow>
                      ))
                    ) : trades.length > 0 ? (
                      trades.map((trade, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(trade.time / 1000)}</TableCell>
                          <TableCell>
                            <Chip
                              label={trade.side}
                              color={
                                trade.side.includes("LONG")
                                  ? "success"
                                  : "error"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatNumber(trade.price)}</TableCell>
                          <TableCell>{trade.quantity}</TableCell>
                          <TableCell>{trade.reason}</TableCell>
                          <TableCell
                            sx={{
                              color:
                                (trade.pnl || 0) > 0
                                  ? "success.main"
                                  : (trade.pnl || 0) < 0
                                  ? "error.main"
                                  : "inherit",
                            }}
                          >
                            {trade.pnl ? formatNumber(trade.pnl) : "-"}
                          </TableCell>
                          <TableCell
                            sx={{
                              color:
                                (trade.position_pnl || 0) > 0
                                  ? "success.main"
                                  : (trade.position_pnl || 0) < 0
                                  ? "error.main"
                                  : "inherit",
                            }}
                          >
                            {trade.position_pnl
                              ? formatNumber(trade.position_pnl)
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          Không có dữ liệu giao dịch
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default memo(ResultView, areEqual);
