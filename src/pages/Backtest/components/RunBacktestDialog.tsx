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
  Switch,
  FormControlLabel,
} from "@mui/material";
import { areEqual } from "@/utils/common";
import { useTranslation } from "react-i18next";

interface RunBacktestDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (startDate: number, endDate: number, combineBalance: boolean) => void;
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
  const [combineBalance, setCombineBalance] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleConfirm = useCallback(() => {
    // Validate dates
    if (!startDate || !endDate) {
      setValidationError(t("backtest.runDialog.validation.missing"));
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      setValidationError(t("backtest.runDialog.validation.invalidRange"));
      return;
    }

    setValidationError(null);
    onConfirm(new Date(startDate).getTime(), new Date(endDate).getTime(), combineBalance);
  }, [combineBalance, endDate, onConfirm, startDate, t]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("backtest.runDialog.title")}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, mt: 1 }}>
          <Typography variant="body1" gutterBottom>
            {t("backtest.runDialog.backtestLabel", { name: backtestName })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("backtest.runDialog.description")}
          </Typography>

          <TextField
            label={t("backtest.runDialog.startDate")}
            type="datetime-local"
            fullWidth
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            label={t("backtest.runDialog.endDate")}
            type="datetime-local"
            fullWidth
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={combineBalance}
                  onChange={(_, checked) => setCombineBalance(checked)}
                  color="primary"
                />
              }
              label={t("backtest.runDialog.combineBalance")}
            />
          </Box>

          {validationError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {validationError}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          {t("common.cancel")}
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
              {t("backtest.runDialog.running")}
            </>
          ) : (
            t("backtest.runDialog.confirm")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(RunBacktestDialog, areEqual);
