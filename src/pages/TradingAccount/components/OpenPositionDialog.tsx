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

interface OpenPositionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: OpenPositionRequest) => Promise<void>;
  initialSymbol?: string;
  initialSide?: "BUY" | "SELL";
  initialPositionSide?: "LONG" | "SHORT";
}

const OpenPositionDialog = ({
  open,
  onClose,
  onSubmit,
  initialSymbol = "",
  initialSide = "BUY",
  initialPositionSide = "LONG",
}: OpenPositionDialogProps) => {
  const [formData, setFormData] = useState<OpenPositionRequest>({
    symbol: initialSymbol,
    side: initialSide,
    quantity: 0,
    position_side: initialPositionSide,
    order_type: "MARKET",
    time_in_force: "GTC",
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
        position_side: initialPositionSide,
        order_type: "MARKET",
        time_in_force: "GTC",
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
      [field]: field === 'quantity' || field === 'price' ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.symbol.trim()) {
      setError("Vui lòng nhập symbol");
      return;
    }

    if (formData.quantity <= 0) {
      setError("Số lượng phải lớn hơn 0");
      return;
    }

    if (formData.order_type === "LIMIT" && (!formData.price || formData.price <= 0)) {
      setError("Vui lòng nhập giá hợp lệ cho lệnh LIMIT");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Có lỗi xảy ra khi mở lệnh");
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
        Mở lệnh mới
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
                label="Symbol"
                value={formData.symbol}
                onChange={handleInputChange('symbol')}
                placeholder="BTCUSDT"
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth disabled={isSubmitting}>
                <InputLabel>Hướng</InputLabel>
                <Select
                  value={formData.side}
                  label="Hướng"
                  onChange={handleInputChange('side')}
                >
                  <MenuItem value="BUY">BUY (Mua)</MenuItem>
                  <MenuItem value="SELL">SELL (Bán)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth disabled={isSubmitting}>
                <InputLabel>Position Side</InputLabel>
                <Select
                  value={formData.position_side}
                  label="Position Side"
                  onChange={handleInputChange('position_side')}
                >
                  <MenuItem value="LONG">LONG</MenuItem>
                  <MenuItem value="SHORT">SHORT</MenuItem>
                  <MenuItem value="BOTH">BOTH</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Số lượng"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange('quantity')}
                inputProps={{ min: 0, step: "any" }}
                disabled={isSubmitting}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth disabled={isSubmitting}>
                <InputLabel>Loại lệnh</InputLabel>
                <Select
                  value={formData.order_type}
                  label="Loại lệnh"
                  onChange={handleInputChange('order_type')}
                >
                  <MenuItem value="MARKET">MARKET</MenuItem>
                  <MenuItem value="LIMIT">LIMIT</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.order_type === "LIMIT" && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Giá"
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
                <InputLabel>Time in Force</InputLabel>
                <Select
                  value={formData.time_in_force}
                  label="Time in Force"
                  onChange={handleInputChange('time_in_force')}
                >
                  <MenuItem value="GTC">GTC (Good Till Cancel)</MenuItem>
                  <MenuItem value="IOC">IOC (Immediate or Cancel)</MenuItem>
                  <MenuItem value="FOK">FOK (Fill or Kill)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Order Summary */}
          <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Tóm tắt lệnh:
            </Typography>
            <Typography variant="body2">
              {formData.side} {formData.quantity} {formData.symbol} {formData.position_side}
            </Typography>
            <Typography variant="body2">
              Loại: {formData.order_type}
              {formData.order_type === "LIMIT" && formData.price && ` tại giá ${formData.price}`}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? "Đang xử lý..." : "Mở lệnh"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OpenPositionDialog;
