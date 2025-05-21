import React, { useState, useCallback, memo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Typography,
  MenuItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Popover,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { areEqual, formatDate } from "@utils/common";
import type { BacktestProcess, BacktestStatus } from "@/types/backtest.type";

// Pagination metadata interface
interface PaginationMetadata {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

interface BacktestListProps {
  processes: BacktestProcess[];
  isLoading: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onRun: (id: string) => void;
  onStop: (id: string) => void;
  onRefresh: () => void;
  // Pagination props
  pagination: PaginationMetadata;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

// Linear progress with label component
const LinearProgressWithLabel = memo(({ value }: { value: number }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" value={value} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          value
        )}%`}</Typography>
      </Box>
    </Box>
  );
});

// Status color mapping
const statusColors: Record<BacktestStatus, string> = {
  created: "default",
  queued: "info",
  running: "primary",
  completed: "success",
  failed: "error",
  stopped: "warning",
};

// Status labels in Vietnamese
const statusLabels: Record<BacktestStatus, string> = {
  created: "Đã tạo",
  queued: "Đang chờ",
  running: "Đang chạy",
  completed: "Hoàn thành",
  failed: "Lỗi",
  stopped: "Đã dừng",
};

const BacktestList = ({
  processes,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onRun,
  onStop,
  pagination,
  onPageChange,
  onRowsPerPageChange,
}: BacktestListProps) => {
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const open = Boolean(anchorEl);

  // Handle opening the menu
  const handleMenuClick = useCallback(
    (event: React.MouseEvent<HTMLElement>, id: string) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
      setSelectedId(id);
    },
    []
  );

  // Handle closing the menu
  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedId(null);
  }, []);

  // Handle pagination change
  const handleChangePage = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      onPageChange(newPage + 1); // Convert from 0-based to 1-based for API
    },
    [onPageChange]
  );

  // Handle rows per page change
  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newRowsPerPage = parseInt(event.target.value, 10);
      onRowsPerPageChange(newRowsPerPage);
      onPageChange(1); // Reset to first page when changing rows per page
    },
    [onPageChange, onRowsPerPageChange]
  );

  // Handle actions
  const handleView = useCallback(() => {
    if (selectedId) {
      const process = processes.find((p) => p._id === selectedId);
      if (process) {
        // Thay vì sử dụng navigate, luôn gọi onView để component cha xử lý
        // Truyền selectedId để component cha có thể xử lý dựa trên trạng thái
        onView(selectedId);
      }
      handleMenuClose();
    }
  }, [selectedId, processes, onView, handleMenuClose]);

  const handleEdit = useCallback(() => {
    if (selectedId) {
      onEdit(selectedId);
      handleMenuClose();
    }
  }, [selectedId, onEdit, handleMenuClose]);

  const handleDelete = useCallback(() => {
    if (selectedId) {
      const process = processes.find((p) => p._id === selectedId);
      if (process) {
        onDelete(selectedId, process.name);
      }
      handleMenuClose();
    }
  }, [selectedId, processes, onDelete, handleMenuClose]);

  const handleRun = useCallback(() => {
    if (selectedId) {
      onRun(selectedId);
      handleMenuClose();
    }
  }, [selectedId, onRun, handleMenuClose]);

  const handleStop = useCallback(() => {
    if (selectedId) {
      onStop(selectedId);
      handleMenuClose();
    }
  }, [selectedId, onStop, handleMenuClose]);

  if (isLoading && processes.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (processes.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Không có backtest nào được tìm thấy
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      {isLoading && (
        <LinearProgress sx={{ position: "absolute", width: "100%", top: 0 }} />
      )}
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="backtest processes table">
          <TableHead>
            <TableRow>
              <TableCell>Tên</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Kết quả</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {processes.map((process) => (
              <TableRow hover key={process._id}>
                <TableCell component="th" scope="row">
                  {process.name}
                </TableCell>
                <TableCell>
                  <Tooltip title={process.description} arrow>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {process.description}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip
                    label={statusLabels[process.status]}
                    color={statusColors[process.status] as any}
                    size="small"
                  />
                </TableCell>
                <TableCell
                  sx={{
                    minWidth: 150,
                  }}
                >
                  {process.status === "completed" ? (
                    <Tooltip
                      title={process.summary || "Không có thông tin"}
                      arrow
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {process.summary || "Không có thông tin"}
                      </Typography>
                    </Tooltip>
                  ) : (
                    <LinearProgressWithLabel value={process.progress} />
                  )}
                </TableCell>
                <TableCell>{formatDate(process.created_at)}</TableCell>
                <TableCell>
                  <IconButton
                    aria-label="more"
                    aria-controls={`backtest-menu-${process._id}`}
                    aria-haspopup="true"
                    onClick={(e) => handleMenuClick(e, process._id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={pagination.total}
        rowsPerPage={pagination.pageSize}
        page={pagination.page - 1} // Convert from 1-based to 0-based for Material-UI
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Dòng trên trang:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} của ${count}`
        }
      />

      {/* Actions Menu - Using Popover for better positioning */}
      <Popover
        id="backtest-menu"
        open={open}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: { minWidth: 180 },
          },
        }}
      >
        {selectedId &&
          processes &&
          processes.length > 0 &&
          (processes.find((p) => p._id === selectedId)?.num_results || 0) >
            0 && (
            <MenuItem onClick={handleView}>
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Xem chi tiết" />
            </MenuItem>
          )}
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Chỉnh sửa" />
        </MenuItem>
        {selectedId && (
          <>
            {!["running", "queued"].includes(
              processes.find((p) => p._id === selectedId)?.status as string
            ) ? (
              <MenuItem onClick={handleRun}>
                <ListItemIcon>
                  <PlayArrowIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Chạy backtest" />
              </MenuItem>
            ) : (
              <MenuItem onClick={handleStop}>
                <ListItemIcon>
                  <StopIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Dừng backtest" />
              </MenuItem>
            )}
          </>
        )}
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText
            primary="Xóa"
            primaryTypographyProps={{ color: "error" }}
          />
        </MenuItem>
      </Popover>
    </Paper>
  );
};

export default memo(BacktestList, areEqual);
