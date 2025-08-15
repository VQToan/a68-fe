import { memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { TradingAccount, TradingExchangeType, AccountStatusType } from "@/types/trading.types";
import { areEqual } from "@/utils/common";

interface TradingAccountListProps {
  accounts: TradingAccount[];
  isLoading: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onRefresh: () => void;
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

// Exchange chip color mapping
const getExchangeColor = (exchange: TradingExchangeType): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (exchange) {
    case "binance":
      return "warning";
    case "bybit":
      return "info";
    case "okx":
      return "secondary";
    case "bitget":
      return "primary";
    default:
      return "default";
  }
};

const getExchangeLabel = (exchange: TradingExchangeType): string => {
  switch (exchange) {
    case "binance":
      return "Binance";
    case "bybit":
      return "Bybit";
    case "okx":
      return "OKX";
    case "bitget":
      return "Bitget";
    default:
      return String(exchange).toUpperCase();
  }
};

// Status chip color mapping
const getStatusColor = (status: AccountStatusType): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case "valid":
      return "success";
    case "invalid":
      return "error";
    case "pending":
      return "warning";
    case "error":
      return "error";
    case "unsupported":
      return "default";
    default:
      return "default";
  }
};

const getStatusLabel = (status: AccountStatusType): string => {
  switch (status) {
    case "valid":
      return "Hợp lệ";
    case "invalid":
      return "Không hợp lệ";
    case "pending":
      return "Đang xác thực";
    case "error":
      return "Lỗi";
    case "unsupported":
      return "Không hỗ trợ";
    default:
      return String(status).toUpperCase();
  }
};

const TradingAccountList = ({
  accounts,
  isLoading,
  onView,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
  onRowsPerPageChange,
}: TradingAccountListProps) => {
  const handlePageChange = (_event: unknown, newPage: number) => {
    onPageChange(newPage + 1); // MUI uses 0-based indexing, our API uses 1-based
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  if (isLoading && accounts.length === 0) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (accounts.length === 0) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
      >
        <Typography variant="body1" color="text.secondary">
          Không có tài khoản trading nào
        </Typography>
      </Box>
    );
  }

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên tài khoản</TableCell>
              <TableCell>Sàn giao dịch</TableCell>
              <TableCell>API Key</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Số dư</TableCell>
              <TableCell>Chat IDs</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account._id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {account.account_name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getExchangeLabel(account.exchange)}
                    color={getExchangeColor(account.exchange)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {account.api_key_masked.slice(0, 10)}...{account.api_key_masked.slice(-10)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(account.status)}
                    color={getStatusColor(account.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {account.balance ? (
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        ${account.balance.available_balance.toFixed(4)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Khả dụng
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có dữ liệu
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {account.chat_ids.length > 0 
                      ? `${account.chat_ids.length} chat ID(s)`
                      : "Không có"
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(account.created_at).toLocaleDateString('vi-VN')}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {/* View button */}
                    <Tooltip title="Xem chi tiết">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => onView(account._id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>

                    {/* Edit button */}
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(account._id)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    {/* Delete button */}
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(account._id, account.account_name)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        component="div"
        count={pagination.total}
        page={pagination.page - 1} // Convert to 0-based indexing for MUI
        onPageChange={handlePageChange}
        rowsPerPage={pagination.page_size}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[10, 20, 50, 100]}
        labelRowsPerPage="Số dòng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} trong số ${count !== -1 ? count : `hơn ${to}`}`
        }
      />
    </Paper>
  );
};

export default memo(TradingAccountList, areEqual);
