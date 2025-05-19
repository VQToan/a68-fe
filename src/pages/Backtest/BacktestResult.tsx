import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";
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
import type {
  BacktestMetrics,
  BacktestResult,
  BacktestTrade,
} from "@/services/backtest.service";

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
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsHeight, setStatsHeight] = useState<number>(0);

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
        start_date: item.start_date,
        end_date: item.end_date,
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
    () => selectedResult?.metrics || ({} as BacktestMetrics),
    [selectedResult]
  );
  const trades = useMemo(
    () => selectedResult?.trades || ([] as BacktestTrade[]),
    [selectedResult]
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
  }, [selectedResult, metrics]);

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
                  label={`Symbol: ${
                    result.parameters?.SYMBOL?.toUpperCase() || "N/A"
                  }`}
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
                        <em>Chọn kết quả</em>
                      </MenuItem>
                      {resultsList.map((resultItem) => (
                        <MenuItem key={resultItem._id} value={resultItem._id}>
                          {formatDate(resultItem.start_date / 1000)} -{" "}
                          {formatDate(resultItem.end_date / 1000)}
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
          <Box ref={statsRef}>
            <PerformanceStats
              metrics={metrics}
              parameters={result.parameters || {}}
            />
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
                <Typography variant="subtitle1" fontWeight="medium">
                  Tổng số: <strong>{trades.length}</strong> giao dịch
                </Typography>
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
                      <TableCell>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="body2" fontWeight="bold">
                            Chi tiết giao dịch
                          </Typography>
                          <Box>
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
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell colSpan={5}></TableCell>
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
                    {trades.length > 0 ? (
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
