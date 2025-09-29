import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Chip,
} from "@mui/material";
import type { PositionSummary, ClosePositionRequest } from "@/types/trading.types";
import { useTranslation } from "react-i18next";

interface ClosePositionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ClosePositionRequest) => Promise<void>;
  position: PositionSummary | null;
}

const ClosePositionDialog = ({
  open,
  onClose,
  onSubmit,
  position,
}: ClosePositionDialogProps) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!position) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const closeData: ClosePositionRequest = {
        symbol: position.symbol,
        position_side: position.position_side as "BOTH" | "LONG" | "SHORT",
        reduce_only: true,
      };

      await onSubmit(closeData);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : t("tradingAccount.detail.closeDialog.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      onClose();
    }
  };

  if (!position) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("tradingAccount.detail.closeDialog.title")}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Alert severity="warning" sx={{ mb: 3 }}>
            {t("tradingAccount.detail.closeDialog.warning")}
          </Alert>

          {/* Position Details */}
          <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              {t("tradingAccount.detail.closeDialog.detailsTitle")}
            </Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  {t("tradingAccount.detail.closeDialog.fields.symbol")}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {position.symbol}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  {t("tradingAccount.detail.closeDialog.fields.type")}
                </Typography>
                <Chip
                  label={`${position.side} ${position.position_side}`}
                  color={position.side === "BUY" ? "success" : "error"}
                  size="small"
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  {t("tradingAccount.detail.closeDialog.fields.quantity")}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {position.quantity}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  {t("tradingAccount.detail.closeDialog.fields.entryPrice")}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  ${position.entry_price.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  {t("tradingAccount.detail.closeDialog.fields.currentPrice")}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  ${position.mark_price.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  {t("tradingAccount.detail.closeDialog.fields.unrealizedPnl")}
                </Typography>
                <Box sx={{ textAlign: "right" }}>
                  <Typography 
                    variant="body2" 
                    fontWeight="medium"
                    color={position.unrealized_pnl >= 0 ? "success.main" : "error.main"}
                  >
                    ${position.unrealized_pnl.toFixed(2)}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color={position.pnl_percentage >= 0 ? "success.main" : "error.main"}
                  >
                    ({position.pnl_percentage.toFixed(2)}%)
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? t("tradingAccount.detail.closeDialog.actions.submitting") : t("tradingAccount.detail.closeDialog.actions.submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClosePositionDialog;
