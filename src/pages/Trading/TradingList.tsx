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
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import type { TradingProcess, TradingStatusType } from "@/types/trading.types";
import { areEqual } from "@/utils/common";

interface TradingListProps {
  processes: TradingProcess[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
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

// Status chip color mapping
const getStatusColor = (status: TradingStatusType): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case "running":
      return "success";
    case "stopped":
      return "default";
    case "failed":
      return "error";
    case "paused":
      return "warning";
    case "queued":
      return "info";
    case "created":
      return "secondary";
    default:
      return "default";
  }
};

const getStatusLabel = (status: TradingStatusType): string => {
  switch (status) {
    case "created":
      return "Đã tạo";
    case "queued":
      return "Đang chờ";
    case "running":
      return "Đang chạy";
    case "stopped":
      return "Đã dừng";
    case "failed":
      return "Thất bại";
    case "paused":
      return "Tạm dừng";
    default:
      return status;
  }
};

const TradingList = ({
  processes,
  isLoading,
  onEdit,
  onDelete,
  onStart,
  onStop,
  pagination,
  onPageChange,
  onRowsPerPageChange,
}: TradingListProps) => {
  const handlePageChange = (_event: unknown, newPage: number) => {
    onPageChange(newPage + 1); // MUI uses 0-based indexing, our API uses 1-based
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  if (isLoading && processes.length === 0) {
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

  if (processes.length === 0) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
      >
        <Typography variant="body1" color="text.secondary">
          Không có trading process nào
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
              <TableCell>Tên</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Tài khoản Trading</TableCell>
              <TableCell>Bot Template</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {processes.map((process) => (
              <TableRow key={process._id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {process.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {process.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(process.status)}
                    color={getStatusColor(process.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {process.trading_account_name || "N/A"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {process.bot_template_name || "N/A"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(process.created_at).toLocaleDateString('vi-VN')}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {/* Start button - only show if not running */}
                    {process.status !== "running" && (
                      <Tooltip title="Bắt đầu trading">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => onStart(process._id)}
                        >
                          <PlayArrowIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Stop button - only show if running */}
                    {process.status === "running" && (
                      <Tooltip title="Dừng trading">
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => onStop(process._id)}
                        >
                          <StopIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Edit button */}
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(process._id)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    {/* Delete button - only show if not running */}
                    {process.status !== "running" && (
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(process._id, process.name)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
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
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Số dòng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} trong số ${count !== -1 ? count : `hơn ${to}`}`
        }
      />
    </Paper>
  );
};

export default memo(TradingList, areEqual);
