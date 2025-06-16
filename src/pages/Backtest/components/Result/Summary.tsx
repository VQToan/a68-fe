import React, { memo, useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Chip,
  Paper,
  Typography,
  Skeleton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import { useBacktest } from "@/hooks/useBacktest";
import { areEqual, formatDate } from "@/utils/common";

interface SummaryProps {
  id?: string;
  setSymbol?: (symbol: string) => void;
}

const Summary: React.FC<SummaryProps> = ({ id, setSymbol }) => {
  const { isLoading, error, currentProcess, getProcessById } = useBacktest();
  const [parametersOpen, setParametersOpen] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      getProcessById(id);
    }
  }, [id, getProcessById]);

  useEffect(() => {
    if (currentProcess && setSymbol) {
      setSymbol(currentProcess.parameters.SYMBOL || null);
    }
  }, [currentProcess, setSymbol]);

  const handleOpenParameters = useCallback(() => {
    setParametersOpen(true);
  }, []);

  const handleCloseParameters = useCallback(() => {
    setParametersOpen(false);
  }, []);

  const parameters = useMemo(() => {
    if (!currentProcess) return [];

    const params = currentProcess.parameters || {};
    return Object.entries(params)
      .filter(
        ([key, value]) =>
          value !== undefined &&
          value !== null &&
          key !== "START_DATE" &&
          key !== "END_DATE"
      )
      .map(([key, value]) => ({
        key,
        name: key,
        value: value,
      }));
  }, [currentProcess]);

  if (isLoading) {
    return (
      <Paper
        elevation={3}
        sx={{
          padding: 2,
          display: "flex",
          flexDirection: "column",
          justifyItems: "start",
        }}
      >
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" height={60} sx={{ mb: 2 }} />

        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          <Skeleton variant="rounded" width={120} height={32} />
          <Skeleton variant="rounded" width={150} height={32} />
          <Skeleton variant="rounded" width={130} height={32} />
        </Box>

        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width={180} height={40} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        elevation={3}
        sx={{
          padding: 2,
          display: "flex",
          flexDirection: "column",
          justifyItems: "start",
        }}
      >
        <Typography color="error" variant="body1">
          Lỗi khi tải dữ liệu: {error}
        </Typography>
      </Paper>
    );
  }

  if (!currentProcess) {
    return (
      <Paper
        elevation={3}
        sx={{
          padding: 2,
          display: "flex",
          flexDirection: "column",
          justifyItems: "start",
        }}
      >
        <Typography variant="body1">Không tìm thấy dữ liệu backtest</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        display: "flex",
        flexDirection: "column",
        justifyItems: "start",
      }}
    >
      <Typography variant="h5">{currentProcess.name}</Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {currentProcess.description}
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
        <Chip
          label={`Symbol: ${
            currentProcess.parameters?.SYMBOL?.toUpperCase() || "N/A"
          }`}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`Tạo lúc: ${formatDate(currentProcess.created_at)}`}
          color="info"
          variant="outlined"
        />
        <Chip
          label={`Trạng thái: ${currentProcess.status}`}
          color={
            currentProcess.status === "completed"
              ? "success"
              : currentProcess.status === "failed"
              ? "error"
              : "warning"
          }
          variant="outlined"
        />
      </Box>

      {/* Button to open parameters dialog */}
      <Button
        variant="outlined"
        startIcon={<SettingsIcon />}
        onClick={handleOpenParameters}
        sx={{ alignSelf: "flex-start", mt: 1 }}
      >
        Xem thông số backtest
      </Button>
      <Chip
        label={`Khung Trade: ${currentProcess.parameters?.INTERVAL_1 || "N/A"}`}
        color="secondary"
        variant="outlined"
        sx={{ mt: 1 }}
      />
      <Chip
        label={`Khung Trend: ${currentProcess.parameters?.INTERVAL_2 || "N/A"}`}
        color="secondary"
        variant="outlined"
        sx={{ mt: 1 }}
      />
      {/* quantity */}
      <Chip
        label={`Số lượng: ${
          currentProcess.parameters?.ENTRY_PERCENTAGE || "N/A"
        }`}
        color="secondary"
        variant="outlined"
        sx={{ mt: 1 }}
      />

      {/* Parameters Dialog */}
      <Dialog
        open={parametersOpen}
        onClose={handleCloseParameters}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Thông số Backtest</Typography>
          <Button
            onClick={handleCloseParameters}
            color="inherit"
            sx={{ minWidth: "auto", p: 0.5 }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", width: "40%" }}>
                    Tham số
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "60%" }}>
                    Giá trị
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {parameters.map((param) => (
                  <TableRow key={param.key}>
                    <TableCell sx={{ fontWeight: "medium" }}>
                      {param.name}
                    </TableCell>
                    <TableCell>{String(param.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseParameters} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default memo(Summary, areEqual);
