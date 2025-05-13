import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Chip,
  Divider,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  IconButton,
  Tooltip,
  type SelectChangeEvent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import BacktestChart from "./components/BacktestChart";
import PerformanceStats from "./components/PerformanceStats";
import { formatDate, formatNumber } from "@utils/common";
import { useBacktest } from "@hooks/useBacktest";
import { areEqual } from "@/utils/common";
import type { BacktestMetrics, BacktestResult, BacktestTrade } from "@/services/backtest.service";

const INTERVALS = ["1m", "3m", "5m", "15m", "30m", "1h", "4h", "1d"];

interface BacktestResultProps {
  id?: string;
  onBack?: () => void;
}

const BacktestResult: React.FC<BacktestResultProps> = ({
  id: propId,
  onBack,
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const id = propId || paramId;

  const { isLoading, error, getResult, clearResult, resultLoading, result } =
    useBacktest();

  const [selectedInterval, setSelectedInterval] = useState<string>("");
  const [selectedResultId, setSelectedResultId] = useState<string>("");

  const handleIntervalChange = useCallback((event: SelectChangeEvent) => {
    setSelectedInterval(event.target.value);
  }, []);

  const handleResultChange = useCallback((event: SelectChangeEvent) => {
    const newResultId = event.target.value;
    setSelectedResultId(newResultId);
  }, []);

  const handleBackToList = useCallback(() => {
    if (onBack) {
      onBack();
    }
  }, [onBack]);

  const handleExportResults = useCallback(() => {
    if (!result) return;

    const dataStr = JSON.stringify(result, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `backtest-result-${id}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result, id]);

  const resultsList = useMemo(() => {
    if (result && result.results) {
      return result.results.map((item) => ({
        _id: item.result_id,
        created_at: item.created_at,
      }));
    }
    return [];
  }, [result]);

  const selectedResult = useMemo(() => {
    if (selectedResultId) {
      return result?.results?.find(
        (item) => item.result_id === selectedResultId
      );
    }
    return null;
  }, [selectedResultId, result]);

  const metrics = useMemo(
    () => selectedResult?.metrics || {} as BacktestMetrics,
    [selectedResult]
  );
  const trades = useMemo(() => selectedResult?.trades || [] as BacktestTrade[], [selectedResult]);

  const profitableTrades = useMemo(
    () => trades.filter((trade) => trade.position_pnl > 0),
    [trades]
  );

  const unprofitableTrades = useMemo(
    () => trades.filter((trade) => trade.position_pnl < 0),
    [trades]
  );

  // Lấy kết quả backtest và danh sách các kết quả
  useEffect(() => {
    if (id) {
      getResult(id);
    }
    return () => {
      clearResult();
    };
  }, [id, getResult, clearResult]);

  useEffect(() => {
    if (result && result.parameters) {
      if (result.parameters.INTERVAL_1) {
        setSelectedInterval(result.parameters.INTERVAL_1);
      } else if (result.parameters.INTERVAL) {
        setSelectedInterval(result.parameters.INTERVAL);
      } else {
        setSelectedInterval("5m"); // Default fallback
      }
    }
  }, [result]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Skeleton variant="rectangular" height={80} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!result) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">Không tìm thấy dữ liệu backtest</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={handleBackToList} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Kết quả Backtest
        </Typography>
      </Box>

      <Box mb={4}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="h5" gutterBottom>
                {result.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {result.description}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip
                  label={`Symbol: ${result.parameters?.SYMBOL || "N/A"}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`Hoàn thành: ${formatDate(result.created_at)}`}
                  color="success"
                  variant="outlined"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                  mt: { xs: 2, md: 0 },
                }}
              >
                {resultsList && resultsList.length > 0 && (
                  <FormControl variant="outlined" sx={{ minWidth: 250, mr: 2 }}>
                    <InputLabel id="result-select-label">
                      Chọn kết quả
                    </InputLabel>
                    <Select
                      labelId="result-select-label"
                      id="result-select"
                      value={selectedResultId}
                      onChange={handleResultChange}
                      label="Chọn kết quả"
                      disabled={resultLoading}
                    >
                      <MenuItem value="">
                        Kết quả hiện tại ({formatDate(result.created_at)})
                      </MenuItem>
                      {resultsList.map((resultItem) => (
                        <MenuItem key={resultItem._id} value={resultItem._id}>
                          {formatDate(resultItem.created_at)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Tooltip title="Xuất kết quả">
                  <IconButton onClick={handleExportResults} color="primary">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        <Grid size={12}>
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
                  symbol={result.parameters?.SYMBOL || ""}
                  interval={selectedInterval}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <PerformanceStats 
            metrics={metrics} 
            parameters={result.parameters || {}}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Danh sách giao dịch
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Thời gian</TableCell>
                      <TableCell>Loại</TableCell>
                      <TableCell>Giá</TableCell>
                      <TableCell>Khối lượng</TableCell>
                      <TableCell>Lý do</TableCell>
                      <TableCell>PnL</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trades.length > 0 ? (
                      trades.map((trade, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(trade.time/1000)}</TableCell>
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
                        <TableCell colSpan={6} align="center">
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
    </Container>
  );
};

export default memo(BacktestResult, areEqual);
