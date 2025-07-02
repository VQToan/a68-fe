import React, {
  useState,
  useEffect,
  useRef,
  memo,
  useCallback,
  useMemo,
} from "react";
import { Box, CircularProgress, Alert, Typography } from "@mui/material";
import { useChart } from "@/hooks/useChart";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  CrosshairMode,
  createSeriesMarkers,
} from "lightweight-charts";
import type {
  IChartApi,
  UTCTimestamp,
  LogicalRangeChangeEventHandler,
} from "lightweight-charts";
import { areEqual } from "@/utils/common";
import type { BacktestTrade } from "@/services/backtest.service";
import { getFormattedSymbol, getIntervalInMs } from "@/utils/chartUtils";
import moment from "moment";
import { useDebounce } from "@/utils/debounceUtils";

interface BacktestChartProps {
  trades: BacktestTrade[];
  symbol: string;
  interval: string;
}

const BacktestChart: React.FC<BacktestChartProps> = ({
  trades,
  symbol,
  interval,
}) => {
  const { fetchCandles, error: apiError } = useChart();
  const [chartData, setChartData] = useState<any[]>([]);
  const [visibleBars, setVisibleBars] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: '' });
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const isDisposedRef = useRef<boolean>(false);
  const crosshairMoveHandlerRef = useRef<any>(null);
  const [loadMoreParams, setLoadMoreParams] = useState<{
    barsToLoad: number;
    side: "L" | "R";
  }>({ barsToLoad: 50, side: "L" });
  const debouncedLoadMoreParams = useDebounce(loadMoreParams, 500);

  // Prepare buy/sell markers from trades
  const tradeMarkers = useMemo(() => {
    if (!trades?.length) return [];

    // Define color and shape mapping for different trade types
    const getMarkerStyle = (trade: BacktestTrade) => {
      const isLong = trade.side.includes("LONG");
      const isOpen = trade.reason === "ENTRY" || trade.reason === "DCA" || 
                    trade.reason.includes("ENTRY HEDGE") || trade.reason.includes("DCA HEDGE");
      const isClose = trade.reason === "EXIT" || trade.reason === "CUTLOSS" || trade.reason === "MAX LOSS" ||
                     trade.reason.includes("EXIT HEDGE") || trade.reason.includes("CUT LOSS HEDGE");

      let color: string;
      let shape: "arrowUp" | "arrowDown" | "circle" | "square";
      let text: string;
      
      // Position based on trade side
      const position: "belowBar" | "aboveBar" = isLong ? "belowBar" : "aboveBar";

      // Determine marker style based on trade type
      if (isLong && isOpen) {
        // LONG-OPEN: Purple B
        color = "#9c27b0";
        shape = "arrowUp";
        text = "B";
      } else if (isLong && isClose) {
        // LONG-CLOSE: Purple S
        color = "#9c27b0";
        shape = "arrowDown";
        text = "S";
      } else if (!isLong && isOpen) {
        // SHORT-OPEN: Dark Yellow S
        color = "#f57f17";
        shape = "arrowDown";
        text = "S";
      } else if (!isLong && isClose) {
        // SHORT-CLOSE: Dark Yellow B
        color = "#f57f17";
        shape = "arrowUp";
        text = "B";
      } else {
        // Default fallback
        color = "#607d8b";
        shape = "circle";
        text = "?";
      }

      return { color, shape, position, text };
    };

    return trades
      .filter((trade) => 
        // Include all trade types for visualization
        trade.reason === "ENTRY" ||
        trade.reason === "EXIT" ||
        trade.reason === "DCA" ||
        trade.reason === "CUTLOSS" ||
        trade.reason === "MAX LOSS" ||
        trade.reason.includes("ENTRY HEDGE") ||
        trade.reason.includes("EXIT HEDGE") ||
        trade.reason.includes("CUT LOSS HEDGE") ||
        trade.reason.includes("DCA HEDGE")
      )
      .map((trade) => {
        const style = getMarkerStyle(trade);
        return {
          time: (trade.time / 1000) as UTCTimestamp, // Convert milliseconds to seconds for lightweight-charts
          position: style.position,
          color: style.color,
          shape: style.shape,
          text: style.text,
          size: 1,
          // Store trade info for tooltip
          tradeInfo: {
            reason: trade.reason,
            price: trade.price,
            pnl: trade.pnl,
            side: trade.side,
            quantity: trade.quantity
          }
        };
      }) as any[];
  }, [trades]);

  const loadMoreData = useCallback(
    async (
      barsToLoad: number = debouncedLoadMoreParams.barsToLoad,
      side: "L" | "R" = debouncedLoadMoreParams.side
    ) => {
      if (!chartContainerRef.current) return;
      // Calculate start time as a number of intervals before the earliest time
      const intervalMs = getIntervalInMs(interval);
      const formattedSymbol = getFormattedSymbol(symbol);
      const now_ts = moment().unix() * 1000; // Current time in milliseconds
      let startTime: number = 0;
      let endTime: number = 0;
      if (side === "L") {
        startTime = chartData[0].time * 1000 - intervalMs * barsToLoad; // Convert to milliseconds
        endTime = startTime + intervalMs * barsToLoad;
      } else if (side === "R") {
        startTime = chartData[chartData.length - 1].time * 1000 + 1;
        endTime = startTime + intervalMs * barsToLoad;
      }
      if (startTime >= now_ts) {
        console.error("No more data to load");
        return;
      }
      // Fetch additional candles
      const additionalCandles = await fetchCandles(
        formattedSymbol,
        interval,
        startTime,
        endTime > now_ts ? now_ts : endTime
      );

      if (additionalCandles.length > 0) {
        // Format data for chart library
        const formattedData = additionalCandles.map((candle) => ({
          time: (candle.time / 1000) as UTCTimestamp, // convert to seconds for lightweight-charts
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));
        const sliceStart =
          side === "L" ? 0 : chartData.length + formattedData.length - 400;
        const sliceEnd =
          side === "L" ? 400 : chartData.length + formattedData.length;
        setChartData((prevData) =>
          [...formattedData, ...prevData]
            .sort((a, b) => a.time - b.time)
            .slice(sliceStart, sliceEnd)
        );
      }
    },
    [
      fetchCandles,
      interval,
      symbol,
      chartData,
      setChartData,
      getFormattedSymbol,
      getIntervalInMs,
    ]
  );

  // Load more data when visible range changes
  useEffect(() => {
    if (debouncedLoadMoreParams) {
      loadMoreData(
        debouncedLoadMoreParams.barsToLoad,
        debouncedLoadMoreParams.side
      );
    }
  }, [debouncedLoadMoreParams]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up any existing chart
    if (chartRef.current) {
      // Mark as disposed before removing
      isDisposedRef.current = true;
      try {
        chartRef.current.remove();
      } catch (e) {
        console.error("Error removing chart:", e);
      }
      chartRef.current = null;
      isDisposedRef.current = false;
    }

    // Create new chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#333",
      },
      grid: {
        vertLines: {
          color: "#f0f0f0",
        },
        horzLines: {
          color: "#f0f0f0",
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: "#f0f0f0",
      },
      // Enable zoom with mouse wheel
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },

      // Enable zooming with pinch gesture on mobile
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      timeScale: {
        borderColor: "#f0f0f0",
        timeVisible: true,
      },
    });

    // Add candle series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    candleSeries.setData(chartData);
    createSeriesMarkers(candleSeries, tradeMarkers); // Add trade markers to the chart

    // Add mouse event handlers for tooltip
    const crosshairMoveHandler = (param: any) => {
      if (!param.point || !param.time) {
        setTooltip(prev => ({ ...prev, visible: false }));
        return;
      }

      // Find all markers at the same time point (within tolerance)
      const hoveredMarkers = tradeMarkers.filter(marker => {
        const markerTime = marker.time;
        const timeDiff = Math.abs(Number(param.time) - Number(markerTime));
        return timeDiff < 60; // Within 1 minute tolerance
      });

      if (hoveredMarkers.length > 0) {
        // Create tooltip content for all markers at this time point
        const tooltipContent = hoveredMarkers.map((marker, index) => {
          const info = marker.tradeInfo;
          return `${index > 0 ? '\n---\n' : ''}${info.reason} - ${info.side}
Price: ${info.price.toFixed(3)}
Quantity: ${info.quantity.toFixed(3)}${info.pnl ? `\nPnL: ${info.pnl.toFixed(3)}` : ''}`;
        }).join('');

        setTooltip({
          visible: true,
          x: param.point.x + 10,
          y: param.point.y - 50,
          content: tooltipContent
        });
      } else {
        setTooltip(prev => ({ ...prev, visible: false }));
      }
    };

    chart.subscribeCrosshairMove(crosshairMoveHandler);
    crosshairMoveHandlerRef.current = crosshairMoveHandler;

    // Handle window resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current && !isDisposedRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    // Add visible range change handler for loading more data
    const handleVisibleRangeChange: LogicalRangeChangeEventHandler = (
      logicalRange
    ) => {
      if (!logicalRange) return;
      const { from, to } = logicalRange;
      const dataLength = chartData.length;
      const visibleBarsCount = to - from + 1;
      setVisibleBars(visibleBarsCount); // Calculate visible bars
      const barsToLoad = Math.min(50, visibleBarsCount);
      const side = from < 0 ? "L" : to > dataLength ? "R" : null;
      if (side) {
        setLoadMoreParams({ barsToLoad, side });
      }
    };

    // Subscribe to range change events
    chart
      .timeScale()
      .subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

    window.addEventListener("resize", handleResize);

    // Store references
    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    return () => {
      window.removeEventListener("resize", handleResize);
      // Make sure we don't try to use chart methods after it's disposed
      if (chart) {
        try {
          chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
          // Clean up crosshair subscription
          if (crosshairMoveHandlerRef.current) {
            chart.unsubscribeCrosshairMove(crosshairMoveHandlerRef.current);
          }
        } catch (e) {
          console.error("Error unsubscribing from chart events:", e);
        }
      }
      if (chartRef.current) {
        isDisposedRef.current = true; // Mark as disposed
        try {
          chartRef.current.remove();
        } catch (e) {
          console.error("Error removing chart on cleanup:", e);
        }
        chartRef.current = null;
      }
      // Hide tooltip on cleanup
      setTooltip(prev => ({ ...prev, visible: false }));
    };
  }, [chartData, loadMoreData, setVisibleBars, visibleBars, tradeMarkers]);

  // Fetch chart data for symbol and interval using the useChart hook
  useEffect(() => {
    if (!symbol || !interval || !trades || !trades.length) return;

    const loadChartData = async () => {
      try {
        setLoading(true);
        // Ensure symbol has USDT if not already included
        const formattedSymbol = getFormattedSymbol(symbol);
        const now_ts = moment().unix() * 1000; // Current time in milliseconds
        // Get start time from first trade if available
        const loadedBars = Math.min(100, visibleBars);
        const startTime =
          trades.length > 0
            ? Math.floor(trades[0].time) -
              getIntervalInMs(interval) * (loadedBars / 2) // 50 candles before first trade
            : Date.now() - getIntervalInMs(interval) * loadedBars; // Default to last 100 candles

        // Get end time from last trade if available
        const endTime = startTime + getIntervalInMs(interval) * loadedBars; // 100 candles after start time

        if (startTime >= now_ts) {
          console.error("No more data to load");
          return;
        }

        // Call our hook function to get candle data directly from Binance
        const candleData = await fetchCandles(
          formattedSymbol,
          interval,
          startTime,
          endTime > now_ts ? now_ts : endTime
        );
        // Format data for chart library
        const formattedData = candleData.map((candle) => ({
          time: (candle.time / 1000) as UTCTimestamp, // convert to seconds for lightweight-charts
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));

        // Set data on chart
        if (!isDisposedRef.current && candleSeriesRef.current) {
          candleSeriesRef.current.setData(formattedData);

          // Add trade markers to candlestick series
          if (tradeMarkers.length > 0) {
            try {
              // Use createSeriesMarkers to add markers to the candlestick series
              createSeriesMarkers(candleSeriesRef.current, tradeMarkers);
            } catch (markerError) {
              console.error("Error setting markers:", markerError);
            }
          }

          // Fit content to view
          if (chartRef.current && !isDisposedRef.current) {
            chartRef.current.timeScale().fitContent();
          }
        }

        setChartData(formattedData);
        setLoading(false);
      } catch (err: any) {
        console.error("Error loading chart data:", err);
        setError(err.message || "Không thể tải dữ liệu biểu đồ");
        setLoading(false);
      }
    };

    loadChartData();
  }, [symbol, interval, trades, tradeMarkers, fetchCandles]);

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error || apiError) {
    return <Alert severity="error">{error || apiError}</Alert>;
  }

  // Show empty state
  if (chartData.length === 0 && !loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Không có dữ liệu biểu đồ
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Trade Legend */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: 1,
          borderRadius: 1,
          fontSize: "0.75rem",
          boxShadow: 1,
          maxWidth: 200,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: "bold", display: "block" }}>
          Trade Markers:
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
          <Typography variant="caption" sx={{ color: "#9c27b0" }}>
            B Long Open (Purple)
          </Typography>
          <Typography variant="caption" sx={{ color: "#9c27b0" }}>
            S Long Close (Purple)
          </Typography>
          <Typography variant="caption" sx={{ color: "#f57f17" }}>
            S Short Open (Dark Yellow)
          </Typography>
          <Typography variant="caption" sx={{ color: "#f57f17" }}>
            B Short Close (Dark Yellow)
          </Typography>
        </Box>
      </Box>

      {/* Tooltip */}
      {tooltip.visible && (
        <Box
          sx={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 1001,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: 1,
            borderRadius: 1,
            fontSize: "0.75rem",
            whiteSpace: "pre-line",
            pointerEvents: "none",
          }}
        >
          {tooltip.content}
        </Box>
      )}
      
      {/* Chart Container */}
      <Box
        ref={chartContainerRef}
        sx={{
          width: "100%",
          height: "100%",
        }}
      />
    </Box>
  );
};

export default memo(BacktestChart, areEqual);
