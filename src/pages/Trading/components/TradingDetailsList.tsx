import { useState, useEffect, useCallback, memo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Pagination,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useNotification } from "@context/NotificationContext";
import type { TradingDetail, TradingDetailsResponse } from "@/types/trading.types";
import { areEqual } from "@/utils/common";
import * as tradingProcessService from "@services/tradingProcess.service";

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

    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return pageSize;
};

const TradingDetailsList = ({ processId, onShowSetupInfo }: TradingDetailsListProps) => {
  const { showNotification } = useNotification();
  
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
  const fetchTradingDetails = useCallback(async (page: number = 1) => {
    if (!processId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response: TradingDetailsResponse = await tradingProcessService.getTradingDetails(
        processId, 
        page, 
        pageSize
      );
      
      setTradingDetails(response.details);
      setTotal(response.total);
      setCurrentPage(page);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch trading details';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [processId, pageSize, showNotification]);

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
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
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="h6">
            Danh sách Giao dịch ({total})
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Hiển thị {pageSize} mục mỗi trang (tự động điều chỉnh theo màn hình)
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {onShowSetupInfo && (
            <Tooltip title="Xem thông tin setup">
              <IconButton
                size="small"
                onClick={onShowSetupInfo}
              >
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
            {isLoading ? "Đang tải..." : "Làm mới"}
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
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Trading Details Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Giá</TableCell>
                  <TableCell>Lý do</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>PNL</TableCell>
                  <TableCell>Kết quả</TableCell>
                  <TableCell>Position PNL</TableCell>
                  <TableCell>Giá TB Position</TableCell>
                  <TableCell>Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tradingDetails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <Typography variant="body2" color="textSecondary">
                        Chưa có giao dịch nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tradingDetails.map((trade, index) => (
                    <TableRow key={trade._id || `trade-${index}`} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(trade.time).toLocaleString("vi-VN")}
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
                          {trade.pnl >= 0 ? "+" : ""}{trade.pnl.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={trade.position_result}
                          color={trade.position_result === "WIN" ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2"
                          color={trade.position_pnl >= 0 ? "success.main" : "error.main"}
                          fontWeight="medium"
                        >
                          {trade.position_pnl >= 0 ? "+" : ""}{trade.position_pnl.toFixed(2)}
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
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, mt: 3 }}>
              <Typography variant="caption" color="textSecondary">
                Trang {currentPage} / {totalPages} • 
                Hiển thị {Math.min(pageSize, total - (currentPage - 1) * pageSize)} / {total} mục
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
