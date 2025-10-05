import { memo, useMemo } from "react";
import {
  TableBody,
  TableCell,
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { TradingProcess, TradingStatusType } from "@/types/trading.types";
import { areEqual } from "@/utils/common";
import StickyTable from "@components/StickyTable";
import { useTranslation } from "react-i18next";

interface TradingListProps {
  processes: TradingProcess[];
  isLoading: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onStart: (id: string) => void;
  onStop: (process: TradingProcess) => void;
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

const TradingList = ({
  processes,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onStart,
  onStop,
  pagination,
  onPageChange,
  onRowsPerPageChange,
}: TradingListProps) => {
  const { t } = useTranslation();
  const statusLabels = useMemo(
    () => ({
      created: t("trading.list.status.created"),
      queued: t("trading.list.status.queued"),
      running: t("trading.list.status.running"),
      stopped: t("trading.list.status.stopped"),
      failed: t("trading.list.status.failed"),
      paused: t("trading.list.status.paused"),
    }),
    [t]
  );

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
          {t("trading.list.empty")}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ overflow: 'hidden', borderRadius: 2 }}>
      <StickyTable
        height="60vh"
        minWidth={900}
        head={
          <TableHead>
            <TableRow>
              <TableCell>{t("trading.list.headers.name")}</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{t("trading.list.headers.description")}</TableCell>
              <TableCell>{t("trading.list.headers.status")}</TableCell>
              <TableCell>{t("trading.list.headers.daysRunning")}</TableCell>
              <TableCell>{t("trading.list.headers.account")}</TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{t("trading.list.headers.template")}</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{t("trading.list.headers.createdAt")}</TableCell>
              <TableCell align="right">{t("trading.list.headers.actions")}</TableCell>
            </TableRow>
          </TableHead>
        }
        body={
          <TableBody>
            {processes.map((process) => (
              <TableRow key={process._id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {process.name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
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
                    label={statusLabels[process.status] ?? process.status}
                    color={getStatusColor(process.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {(() => {
                      if (!process.started_at) return "-";
                      const start = new Date(process.started_at).getTime();
                      const end = process.status === "running" || !process.stopped_at
                        ? Date.now()
                        : new Date(process.stopped_at).getTime();
                      const diffDays = Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
                      return t("trading.list.runningDays", { count: diffDays });
                    })()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {process.trading_account_name || t("common.notAvailable")}
                  </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                  <Typography variant="body2">
                    {process.bot_template_name || t("common.notAvailable")}
                  </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(process.created_at).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {/* View details button */}
                    <Tooltip title={t("trading.list.tooltips.view")}>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => onView(process._id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>

                    {/* Start button - only show if not running */}
                    {process.status !== "running" && (
                      <Tooltip title={t("trading.list.tooltips.start")}>
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
                    {process.status in ["running", "queued"] && (
                      <Tooltip title={t("trading.list.tooltips.stop")}>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => onStop(process)}
                        >
                          <StopIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Edit button */}
                    <Tooltip title={t("common.edit")}>
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
                      <Tooltip title={t("common.delete")}>
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
        }
      />
      
      <TablePagination
        component="div"
        count={pagination.total}
        page={pagination.page - 1} // Convert to 0-based indexing for MUI
        onPageChange={handlePageChange}
        rowsPerPage={pagination.page_size}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage={t("trading.list.pagination.rowsPerPage")}
        labelDisplayedRows={({ from, to, count }) =>
          t("trading.list.pagination.displayedRows", { from, to, count })
        }
      />
    </Paper>
  );
};

export default memo(TradingList, areEqual);
