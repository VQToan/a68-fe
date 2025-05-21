import React, { useState, useCallback, memo, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Chip,
  Skeleton,
  Alert,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import {
  formatDate,
  formatNumber,
  areEqual,
  downloadJson,
} from "@/utils/common";
import { useBacktestResult } from "@/hooks/useBacktestResult";
import ConfirmDialog from "@/components/ConfirmDialog";

interface ResultListProps {
  processId?: string;
  selectedResultId?: string;
  onViewResult?: (resultId: string) => void;
  symbol?: string;
}

const ResultList: React.FC<ResultListProps> = ({
  processId,
  selectedResultId,
  onViewResult,
  symbol,
}) => {
  const {
    resultsByProcess,
    getBacktestResultsByProcessId,
    getResultDetail,
    deleteBacktestResult,
    loading,
  } = useBacktestResult();

  // State for delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [resultToDelete, setResultToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (processId) {
      getBacktestResultsByProcessId(processId);
    }
  }, [processId, getBacktestResultsByProcessId]);

  const results = useMemo(
    () => (processId && resultsByProcess[processId]) || [],
    [resultsByProcess, processId]
  );

  const handleViewResult = useCallback(
    (resultId: string) => {
      if (onViewResult) {
        onViewResult(resultId);
      }
    },
    [onViewResult]
  );

  const handleOpenDeleteConfirm = useCallback((resultId: string) => {
    setResultToDelete(resultId);
    setDeleteConfirmOpen(true);
  }, []);

  const handleCloseDeleteConfirm = useCallback(() => {
    setDeleteConfirmOpen(false);
    setResultToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (resultToDelete) {
      try {
        await deleteBacktestResult(resultToDelete);

        // After successful deletion, refresh the results list
        if (processId) {
          getBacktestResultsByProcessId(processId);
        }
      } catch (error) {
        console.error("Failed to delete backtest result:", error);
      } finally {
        setDeleteConfirmOpen(false);
        setResultToDelete(null);
      }
    }
  }, [
    resultToDelete,
    deleteBacktestResult,
    processId,
    getBacktestResultsByProcessId,
  ]);

  const handleDownloadResult = useCallback(
    async (resultId: string) => {
      try {
        const resultDetail = await getResultDetail(resultId);
        if (resultDetail) {
          // Create friendly filename with symbol and date range
          const startDate = new Date(resultDetail.start_date)
            .toISOString()
            .split("T")[0];
          const endDate = new Date(resultDetail.end_date)
            .toISOString()
            .split("T")[0];
          const filename = `backtest-${symbol?.toLowerCase()}-${startDate}-to-${endDate}`;

          // Download result as JSON file
          downloadJson(resultDetail, filename);
        }
      } catch (error) {
        console.error("Failed to download result:", error);
      }
    },
    [getResultDetail, symbol]
  );

  return (
    <>
      <Card variant="outlined">
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Danh sách kết quả backtest</Typography>
          </Box>

          {loading ? (
            <Skeleton variant="rectangular" height={200} />
          ) : results.length > 0 ? (
            <List sx={{ maxHeight: 300, overflow: "auto" }}>
              {results.map((resultItem) => (
                <ListItem
                  key={resultItem._id}
                  divider
                  sx={{
                    backgroundColor:
                      selectedResultId && selectedResultId === resultItem._id
                        ? "action.selected"
                        : "inherit",
                  }}
                >
                  <ListItemText
                    primary={`${formatDate(
                      resultItem.start_date / 1000
                    )} - ${formatDate(resultItem.end_date / 1000)}`}
                    secondary={
                      <Box mt={1}>
                        <Chip
                          size="small"
                          label={`Total ROI: ${resultItem.metrics.total_roi.toFixed(
                            2
                          )}%`}
                          color={
                            resultItem.metrics.total_roi > 10
                              ? "success"
                              : "error"
                          }
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          size="small"
                          label={`PnL: ${formatNumber(
                            resultItem.metrics.total_pnl
                          )}`}
                          color={
                            resultItem.metrics.total_pnl > 0
                              ? "success"
                              : "error"
                          }
                        />
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Tải về">
                      <IconButton
                        edge="end"
                        onClick={() => handleDownloadResult(resultItem._id)}
                        color="primary"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xem chi tiết">
                      <IconButton
                        edge="end"
                        onClick={() => handleViewResult(resultItem._id)}
                        color={
                          selectedResultId &&
                          selectedResultId === resultItem._id
                            ? "primary"
                            : "default"
                        }
                        sx={{ ml: 1 }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa kết quả">
                      <IconButton
                        edge="end"
                        onClick={() => handleOpenDeleteConfirm(resultItem._id)}
                        color="error"
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">
              Không có kết quả backtest nào cho quá trình này
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Xóa kết quả backtest"
        message="Bạn có chắc chắn muốn xóa kết quả backtest này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteConfirm}
      />
    </>
  );
};

export default memo(ResultList, areEqual);
