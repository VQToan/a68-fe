import { useState, useEffect, useCallback, memo } from "react";
import {
  Box,
  Typography,
  Paper,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  Pagination,
  IconButton,
  Tooltip,
} from "@mui/material";
import StickyTable from "@components/StickyTable";
import { TableSkeleton } from "@components/skeletons";
import { Refresh as RefreshIcon, Info as InfoIcon } from "@mui/icons-material";
import { useNotification } from "@context/NotificationContext";
import type {
  TradingDetail,
  TradingDetailsResponse,
} from "@/types/trading.types";
import { areEqual } from "@/utils/common";
import * as tradingProcessService from "@services/tradingProcess.service";
import { useTranslation } from "react-i18next";

interface TradingDetailsListProps {
  processId: string;
  onShowSetupInfo?: () => void;
}

// Hook để tính toán page size dựa vào chiều cao màn hình
const usePageSizeByHeight = () => {
  const [pageSize, setPageSize] = useState<number>(20);

  useEffect(() => {
    const calculatePageSize = () => {
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;

      // Điều chỉnh theo kích thước màn hình
      let basePageSize;
      let availableHeight;

      // Mobile (< 768px)
      if (screenWidth < 768) {
        availableHeight = screenHeight - 300; // Ít space hơn trên mobile
        basePageSize = Math.floor(availableHeight / 80); // Rows cao hơn trên mobile
      }
      // Tablet (768px - 1024px)
      else if (screenWidth < 1024) {
        availableHeight = screenHeight - 350;
        basePageSize = Math.floor(availableHeight / 70);
      }
      // Desktop (>= 1024px)
      else {
        availableHeight = screenHeight - 400;
        basePageSize = Math.floor(availableHeight / 60);
      }

      // Đảm bảo page size trong khoảng hợp lý
      const calculatedPageSize = Math.max(10, Math.min(100, basePageSize));

      setPageSize(calculatedPageSize);
    };

    // Tính toán ban đầu
    calculatePageSize();

    // Lắng nghe sự kiện resize với debounce
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculatePageSize, 150); // Debounce 150ms
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return pageSize;
};

const TradingDetailsList = ({
  processId,
  onShowSetupInfo,
}: TradingDetailsListProps) => {
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  // Tính toán page size dựa vào chiều cao màn hình
  const dynamicPageSize = usePageSizeByHeight();

  // Local state
  const [tradingDetails, setTradingDetails] = useState<TradingDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(dynamicPageSize);
  const [error, setError] = useState<string | null>(null);

  // Cập nhật page size khi dynamicPageSize thay đổi
  useEffect(() => {
    setPageSize(dynamicPageSize);
    // Reset về trang 1 khi page size thay đổi để tránh lỗi
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [dynamicPageSize]);

  // Fetch trading details
  const fetchTradingDetails = useCallback(
    async (page: number = 1) => {
      if (!processId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response: TradingDetailsResponse =
          await tradingProcessService.getTradingDetails(
            processId,
            page,
            pageSize
          );

        setTradingDetails(response.details);
        setTotal(response.total);
        setCurrentPage(page);
      } catch (error) {
        const fallbackMessage = t("trading.details.errors.fetch");
        const errorMessage =
          error instanceof Error ? error.message : fallbackMessage;
        setError(errorMessage);
        showNotification(errorMessage, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [processId, pageSize, showNotification, t]
  );

  // Handle page change
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    fetchTradingDetails(page);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchTradingDetails(currentPage);
  };

  // Fetch data on mount and when processId or pageSize changes
  useEffect(() => {
    if (processId && pageSize > 0) {
      fetchTradingDetails(1);
    }
  }, [processId, pageSize, fetchTradingDetails]);

  // Calculate total pages
  const totalPages = Math.ceil(total / pageSize);

  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2.5, md: 3 },
        overflow: "hidden",
        borderRadius: { xs: 1.5, md: 2 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h6">
            {t("trading.details.title", { total })}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {t("trading.details.subtitle", { count: pageSize })}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {onShowSetupInfo && (
            <Tooltip title={t("trading.details.tooltips.setup")}>
              <IconButton size="small" onClick={onShowSetupInfo}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading
              ? t("common.loading")
              : t("trading.details.actions.refresh")}
          </Button>
        </Box>
      </Box>

      {/* Error state */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Box>
      )}

      {/* Loading state */}
      {isLoading && tradingDetails.length === 0 ? (
        <TableSkeleton columns={10} rows={8} showPagination />
      ) : (
        <>
          <StickyTable
            height="60vh"
            minWidth={1100}
            head={
              <TableHead>
                <TableRow>
                  <TableCell>
                    {t("trading.details.tableHeaders.time")}
                  </TableCell>
                  <TableCell>
                    {t("trading.details.tableHeaders.price")}
                  </TableCell>
                  <TableCell>
                    {t("trading.details.tableHeaders.reason")}
                  </TableCell>
                  <TableCell>
                    {t("trading.details.tableHeaders.quantity")}
                  </TableCell>
                  <TableCell>
                    {t("trading.details.tableHeaders.type")}
                  </TableCell>
                  <TableCell>{t("trading.details.tableHeaders.pnl")}</TableCell>
                  <TableCell>
                    {t("trading.details.tableHeaders.result")}
                  </TableCell>
                  <TableCell>
                    {t("trading.details.tableHeaders.positionPnl")}
                  </TableCell>
                  <TableCell>
                    {t("trading.details.tableHeaders.avgPrice")}
                  </TableCell>
                  <TableCell>
                    {t("trading.details.tableHeaders.balance")}
                  </TableCell>
                </TableRow>
              </TableHead>
            }
            body={
              <TableBody>
                {tradingDetails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <Typography variant="body2" color="textSecondary">
                        {t("trading.details.empty")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tradingDetails.map((trade, index) => (
                    <TableRow key={trade._id || `trade-${index}`} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(trade.time).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          ${trade.price.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={trade.reason}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {trade.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={trade.side}
                          color={trade.side === "LONG" ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={trade.pnl >= 0 ? "success.main" : "error.main"}
                          fontWeight="medium"
                        >
                          {trade.pnl >= 0 ? "+" : ""}
                          {trade.pnl.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={trade.position_result}
                          color={
                            trade.position_result === "WIN"
                              ? "success"
                              : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={
                            trade.position_pnl >= 0
                              ? "success.main"
                              : "error.main"
                          }
                          fontWeight="medium"
                        >
                          {trade.position_pnl >= 0 ? "+" : ""}
                          {trade.position_pnl.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          ${trade.position_avg_price.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          ${trade.balance.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            }
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                mt: 3,
              }}
            >
              <Typography variant="caption" color="textSecondary">
                {t("trading.details.pagination.summary", {
                  current: currentPage,
                  total: totalPages,
                  visible: Math.min(
                    pageSize,
                    Math.max(total - (currentPage - 1) * pageSize, 0)
                  ),
                  totalItems: total,
                })}
              </Typography>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                disabled={isLoading}
                color="primary"
                showFirstButton
                showLastButton
                size="medium"
              />
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default memo(TradingDetailsList, areEqual);
