import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import type { OpenPositionRequest } from "@/types/trading.types";
import { useTranslation } from "react-i18next";

interface OpenPositionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: OpenPositionRequest) => Promise<void>;
  initialSymbol?: string;
  initialSide?: "BUY" | "SELL";
  initialPositionSide?: "BOTH" | "LONG" | "SHORT";
}

const OpenPositionDialog = ({
  open,
  onClose,
  onSubmit,
  initialSymbol = "",
  initialSide = "BUY",
  initialPositionSide = "BOTH",
}: OpenPositionDialogProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<OpenPositionRequest>({
    symbol: initialSymbol,
    side: initialSide,
    quantity: 0,
    position_side: initialPositionSide ?? "BOTH",
    order_type: "MARKET",
    time_in_force: "GTC",
    leverage: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        symbol: initialSymbol,
        side: initialSide,
        quantity: 0,
        position_side: initialPositionSide ?? "BOTH",
        order_type: "MARKET",
        time_in_force: "GTC",
        leverage: undefined,
      });
      setError(null);
    }
  }, [open, initialSymbol, initialSide, initialPositionSide]);

  const handleInputChange = (field: keyof OpenPositionRequest) => (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]:
        field === 'quantity'
          ? Number(value)
          : field === 'price'
          ? Number(value)
          : field === 'leverage'
          ? value === "" ? undefined : Number(value)
          : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.symbol.trim()) {
      setError(t("tradingAccount.detail.openDialog.validation.symbol"));
      return;
    }

    if (formData.quantity <= 0) {
      setError(t("tradingAccount.detail.openDialog.validation.quantity"));
      return;
    }

    if (formData.order_type === "LIMIT" && (!formData.price || formData.price <= 0)) {
      setError(t("tradingAccount.detail.openDialog.validation.limitPrice"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : t("tradingAccount.detail.openDialog.validation.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("tradingAccount.detail.openDialog.title")}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t("tradingAccount.detail.openDialog.fields.symbol")}
                value={formData.symbol}
                onChange={handleInputChange('symbol')}
                placeholder="BTCUSDT"
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth disabled={isSubmitting}>
                <InputLabel>{t("tradingAccount.detail.openDialog.fields.side")}</InputLabel>
                <Select
                  value={formData.side}
                  label={t("tradingAccount.detail.openDialog.fields.side")}
                  onChange={handleInputChange('side')}
                >
                  <MenuItem value="BUY">{t("tradingAccount.detail.openDialog.side.buy")}</MenuItem>
                  <MenuItem value="SELL">{t("tradingAccount.detail.openDialog.side.sell")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth disabled={isSubmitting}>
                <InputLabel>{t("tradingAccount.detail.openDialog.fields.positionSide")}</InputLabel>
                <Select
                  value={formData.position_side}
                  label={t("tradingAccount.detail.openDialog.fields.positionSide")}
                  onChange={handleInputChange('position_side')}
                >
                  <MenuItem value="LONG">{t("tradingAccount.detail.openDialog.positionSides.long")}</MenuItem>
                  <MenuItem value="SHORT">{t("tradingAccount.detail.openDialog.positionSides.short")}</MenuItem>
                  <MenuItem value="BOTH">{t("tradingAccount.detail.openDialog.positionSides.both")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={t("tradingAccount.detail.openDialog.fields.quantity")}
                type="number"
                value={formData.quantity}
                onChange={handleInputChange('quantity')}
                inputProps={{ min: 0, step: "any" }}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label={t("tradingAccount.detail.openDialog.fields.leverage")}
                type="number"
                value={formData.leverage ?? ""}
                onChange={handleInputChange('leverage')}
                inputProps={{ min: 0, step: "any" }}
                disabled={isSubmitting}
                placeholder={t("tradingAccount.detail.openDialog.placeholders.leverage")}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth disabled={isSubmitting}>
                <InputLabel>{t("tradingAccount.detail.openDialog.fields.orderType")}</InputLabel>
                <Select
                  value={formData.order_type}
                  label={t("tradingAccount.detail.openDialog.fields.orderType")}
                  onChange={handleInputChange('order_type')}
                >
                  <MenuItem value="MARKET">{t("tradingAccount.detail.openDialog.orderTypes.market")}</MenuItem>
                  <MenuItem value="LIMIT">{t("tradingAccount.detail.openDialog.orderTypes.limit")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.order_type === "LIMIT" && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={t("tradingAccount.detail.openDialog.fields.price")}
                  type="number"
                  value={formData.price || ""}
                  onChange={handleInputChange('price')}
                  inputProps={{ min: 0, step: "any" }}
                  disabled={isSubmitting}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth disabled={isSubmitting}>
                <InputLabel>{t("tradingAccount.detail.openDialog.fields.timeInForce")}</InputLabel>
                <Select
                  value={formData.time_in_force}
                  label={t("tradingAccount.detail.openDialog.fields.timeInForce")}
                  onChange={handleInputChange('time_in_force')}
                >
                  <MenuItem value="GTC">{t("tradingAccount.detail.openDialog.timeInForce.gtc")}</MenuItem>
                  <MenuItem value="IOC">{t("tradingAccount.detail.openDialog.timeInForce.ioc")}</MenuItem>
                  <MenuItem value="FOK">{t("tradingAccount.detail.openDialog.timeInForce.fok")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Order Summary */}
          <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t("tradingAccount.detail.openDialog.summary.title")}
            </Typography>
            <Typography variant="body2">
              {t("tradingAccount.detail.openDialog.summary.line1", {
                side: formData.side,
                quantity: formData.quantity,
                symbol: formData.symbol,
                positionSide: formData.position_side,
              })}
            </Typography>
            <Typography variant="body2">
              {t("tradingAccount.detail.openDialog.summary.orderType", {
                orderType: formData.order_type,
              })}
              {formData.order_type === "LIMIT" && formData.price
                ? ` ${t("tradingAccount.detail.openDialog.summary.limitPrice", { price: formData.price })}`
                : ""}
            </Typography>
            <Typography variant="body2">
              {formData.leverage != null
                ? t("tradingAccount.detail.openDialog.summary.leverageValue", { leverage: formData.leverage })
                : t("tradingAccount.detail.openDialog.summary.leverageNone")}
            </Typography>
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
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? t("tradingAccount.detail.openDialog.actions.submitting") : t("tradingAccount.detail.openDialog.actions.submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OpenPositionDialog;
