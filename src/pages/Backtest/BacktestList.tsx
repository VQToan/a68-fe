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
import { formatDate } from "@utils/common";
import type { BacktestProcess, BacktestStatus } from "@/types/backtest.type";

interface BacktestListProps {
  processes: BacktestProcess[];
  isLoading: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onRun: (id: string) => void;
  onStop: (id: string) => void;
}

// Linear progress with label component
const LinearProgressWithLabel = memo(({ value }: { value: number }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" value={value} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
});

// Status color mapping
const statusColors: Record<BacktestStatus, string> = {
  pending: "default",
  running: "primary",
  completed: "success",
  failed: "error",
  stopped: "warning",
};

// Status labels in Vietnamese
const statusLabels: Record<BacktestStatus, string> = {
  pending: "Đang chờ",
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
}: BacktestListProps) => {
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
      setPage(newPage);
    },
    []
  );

  // Handle rows per page change
  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  // Handle actions
  const handleView = useCallback(() => {
    if (selectedId) {
      onView(selectedId);
      handleMenuClose();
    }
  }, [selectedId, onView, handleMenuClose]);

  const handleEdit = useCallback(() => {
    if (selectedId) {
      onEdit(selectedId);
      handleMenuClose();
    }
  }, [selectedId, onEdit, handleMenuClose]);

  const handleDelete = useCallback(() => {
    if (selectedId) {
      const process = processes.find(p => p._id === selectedId);
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

  // Sliced data for pagination
  const slicedData = processes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isLoading) {
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
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <Typography variant="subtitle1" color="text.secondary">
          Không có backtest nào được tìm thấy
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="backtest processes table">
          <TableHead>
            <TableRow>
              <TableCell>Tên</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Tiến độ</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {slicedData.map((process) => (
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
                <TableCell>
                  <LinearProgressWithLabel value={process.progress} />
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
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={processes.length}
        rowsPerPage={rowsPerPage}
        page={page}
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
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: { minWidth: 180 }
          }
        }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Xem chi tiết" />
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Chỉnh sửa" />
        </MenuItem>
        {selectedId && (
          <>
            {processes.find(p => p._id === selectedId)?.status !== "running" ? (
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
          <ListItemText primary="Xóa" primaryTypographyProps={{ color: "error" }} />
        </MenuItem>
      </Popover>
    </Paper>
  );
};

export default memo(BacktestList);