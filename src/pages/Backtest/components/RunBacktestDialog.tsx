import React, { useState, useCallback, memo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { areEqual } from "@/utils/common";
import DateRangePicker from "@/components/DateRangePicker";

interface RunBacktestDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (startDate: string, endDate: string) => void;
  isLoading: boolean;
  backtestName: string;
}

const RunBacktestDialog: React.FC<RunBacktestDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isLoading,
  backtestName,
}) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleDateRangeChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setValidationError(null);
  }, []);

  const handleConfirm = useCallback(() => {
    // Validate dates
    if (!startDate || !endDate) {
      setValidationError("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      setValidationError("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    setValidationError(null);
    onConfirm(startDate, endDate);
  }, [startDate, endDate, onConfirm]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Chạy Backtest</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, mt: 1 }}>
          <Typography variant="body1" gutterBottom>
            Backtest: <strong>{backtestName}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Vui lòng chọn khoảng thời gian để chạy backtest
          </Typography>

          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateRangeChange}
            label="Khoảng thời gian backtest"
            placeholder="Chọn ngày bắt đầu - ngày kết thúc"
            error={!!validationError}
            helperText={validationError || ""}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Hủy
        </Button>
        <Button
          onClick={handleConfirm}
          color="primary"
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Đang chạy...
            </>
          ) : (
            "Chạy Backtest"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(RunBacktestDialog, areEqual);