import React, { useState, useCallback, memo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { areEqual } from "@/utils/common";

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

  const handleConfirm = useCallback(() => {
    // Validate dates
    if (!startDate || !endDate) {
      setValidationError("Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc");
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
            Vui lòng nhập khoảng thời gian để chạy backtest
          </Typography>

          <TextField
            label="Thời gian bắt đầu"
            type="datetime-local"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Thời gian kết thúc"
            type="datetime-local"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {validationError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {validationError}
            </Typography>
          )}
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