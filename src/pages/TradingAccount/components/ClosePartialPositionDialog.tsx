import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import type { PositionSummary, ClosePartialPositionRequest } from "@/types/trading.types";
import { useTranslation } from "react-i18next";

interface ClosePartialPositionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ClosePartialPositionRequest) => Promise<void>;
  position: PositionSummary | null;
}

const ClosePartialPositionDialog = ({
  open,
  onClose,
  onSubmit,
  position,
}: ClosePartialPositionDialogProps) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open && position) {
      setQuantity(Number(position.quantity) / 2); // Default to half position
      setError(null);
    }
  }, [open, position]);

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setQuantity(value);
  };

  const handleSubmit = async () => {
    if (!position) return;

    if (quantity <= 0) {
      setError(t("tradingAccount.detail.closePartialDialog.validation.quantity"));
      return;
    }

    if (quantity >= Number(position.quantity)) {
      setError(t("tradingAccount.detail.closePartialDialog.validation.maxQuantity"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const closeData: ClosePartialPositionRequest = {
        symbol: position.symbol,
        quantity: quantity,
        position_side: position.position_side as "BOTH" | "LONG" | "SHORT",
        reduce_only: true,
      };

      await onSubmit(closeData);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : t("tradingAccount.detail.closePartialDialog.validation.generic"));
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

  const remainingQuantity = Number(position.quantity) - quantity;
  const partialPnL = (position.unrealized_pnl * quantity) / Number(position.quantity);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("tradingAccount.detail.closePartialDialog.title")}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Position Info */}
          <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1, mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              {t("tradingAccount.detail.closePartialDialog.detailsTitle")}
            </Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  {t("tradingAccount.detail.closePartialDialog.fields.symbol")}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {position.symbol}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  {t("tradingAccount.detail.closePartialDialog.fields.type")}
                </Typography>
                <Chip
                  label={`${position.side} ${position.position_side}`}
                  color={position.side === "BUY" ? "success" : "error"}
                  size="small"
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  {t("tradingAccount.detail.closePartialDialog.fields.currentQuantity")}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {position.quantity}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  {t("tradingAccount.detail.closePartialDialog.fields.currentPnl")}
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="medium"
                  color={position.unrealized_pnl >= 0 ? "success.main" : "error.main"}
                >
                  ${position.unrealized_pnl.toFixed(2)} ({position.pnl_percentage.toFixed(2)}%)
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Close Quantity Input */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t("tradingAccount.detail.closePartialDialog.fields.closeQuantity")}
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                inputProps={{ 
                  min: 0, 
                  max: Number(position.quantity),
                  step: "any" 
                }}
                disabled={isSubmitting}
                helperText={t("tradingAccount.detail.closePartialDialog.fields.maxQuantity", { value: position.quantity })}
              />
            </Grid>

            {/* Quick Select Buttons */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setQuantity(Number(position.quantity) * 0.25)}
                  disabled={isSubmitting}
                >
                  {t("tradingAccount.detail.closePartialDialog.quickSelect.twentyFive")}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setQuantity(Number(position.quantity) * 0.5)}
                  disabled={isSubmitting}
                >
                  {t("tradingAccount.detail.closePartialDialog.quickSelect.fifty")}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setQuantity(Number(position.quantity) * 0.75)}
                  disabled={isSubmitting}
                >
                  {t("tradingAccount.detail.closePartialDialog.quickSelect.seventyFive")}
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Preview */}
          {quantity > 0 && (
            <Box sx={{ mt: 3, p: 2, bgcolor: "info.light", borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("tradingAccount.detail.closePartialDialog.preview.title")}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">
                  {t("tradingAccount.detail.closePartialDialog.preview.closeQuantity")}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {quantity}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">
                  {t("tradingAccount.detail.closePartialDialog.preview.remainingQuantity")}
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {remainingQuantity.toFixed(8)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">
                  {t("tradingAccount.detail.closePartialDialog.preview.estimatedPnl")}
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="medium"
                  color={partialPnL >= 0 ? "success.main" : "error.main"}
                >
                  ${partialPnL.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="warning"
          disabled={isSubmitting || quantity <= 0}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? t("tradingAccount.detail.closePartialDialog.actions.submitting") : t("tradingAccount.detail.closePartialDialog.actions.submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClosePartialPositionDialog;
