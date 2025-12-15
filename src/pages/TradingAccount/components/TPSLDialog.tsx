import { useState, memo, useEffect, useCallback } from "react";
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
  Box,
  Typography,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import type {
  PositionSideType,
  WorkingTypeOption,
  TakeProfitRequest,
  StopLossRequest,
} from "@/types/trading.types";

type TPSLType = "TAKE_PROFIT" | "STOP_LOSS";

interface TPSLDialogProps {
  open: boolean;
  onClose: () => void;
  symbol: string;
  positionSide: PositionSideType;
  currentQuantity: number;
  entryPrice: number;
  markPrice: number;
  onPlaceTakeProfit: (data: TakeProfitRequest) => Promise<void>;
  onPlaceStopLoss: (data: StopLossRequest) => Promise<void>;
}

const TPSLDialog = ({
  open,
  onClose,
  symbol,
  positionSide,
  currentQuantity,
  entryPrice,
  markPrice,
  onPlaceTakeProfit,
  onPlaceStopLoss,
}: TPSLDialogProps) => {
  const { t } = useTranslation();

  // Form state
  const [tpslType, setTpslType] = useState<TPSLType>("TAKE_PROFIT");
  const [stopPrice, setStopPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [useFullQuantity, setUseFullQuantity] = useState(true);
  const [workingType, setWorkingType] =
    useState<WorkingTypeOption>("CONTRACT_PRICE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTpslType("TAKE_PROFIT");
      setStopPrice("");
      setQuantity(currentQuantity.toString());
      setUseFullQuantity(true);
      setWorkingType("CONTRACT_PRICE");
      setError(null);
    }
  }, [open, currentQuantity]);

  // Calculate suggested prices based on position side and type
  const getSuggestedPrice = useCallback(() => {
    if (!entryPrice) return markPrice;

    const priceDiff = entryPrice * 0.02; // 2% default

    if (tpslType === "TAKE_PROFIT") {
      return positionSide === "LONG"
        ? entryPrice + priceDiff
        : entryPrice - priceDiff;
    } else {
      return positionSide === "LONG"
        ? entryPrice - priceDiff
        : entryPrice + priceDiff;
    }
  }, [entryPrice, markPrice, tpslType, positionSide]);

  // Handle submit
  const handleSubmit = async () => {
    // Validate stop price
    const priceValue = parseFloat(stopPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError(t("tradingAccount.tpsl.errors.invalidPrice"));
      return;
    }

    // Validate quantity if not using full
    let quantityValue: number | undefined;
    if (!useFullQuantity) {
      quantityValue = parseFloat(quantity);
      if (
        isNaN(quantityValue) ||
        quantityValue <= 0 ||
        quantityValue > currentQuantity
      ) {
        setError(t("tradingAccount.tpsl.errors.invalidQuantity"));
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const request = {
        symbol,
        position_side: positionSide,
        stop_price: priceValue,
        quantity: useFullQuantity ? undefined : quantityValue,
        working_type: workingType,
      };

      if (tpslType === "TAKE_PROFIT") {
        await onPlaceTakeProfit(request as TakeProfitRequest);
      } else {
        await onPlaceStopLoss(request as StopLossRequest);
      }

      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t("tradingAccount.tpsl.errors.submit");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set suggested price
  const handleUseSuggestedPrice = () => {
    setStopPrice(getSuggestedPrice().toFixed(2));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {positionSide === "LONG" ? (
            <TrendingUpIcon color="success" />
          ) : (
            <TrendingDownIcon color="error" />
          )}
          {t("tradingAccount.tpsl.title")} - {symbol}
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Position Info */}
        <Box
          sx={{ mb: 3, p: 2, bgcolor: "background.default", borderRadius: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            {t("tradingAccount.tpsl.positionInfo")}
          </Typography>
          <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("tradingAccount.tpsl.side")}
              </Typography>
              <Typography
                variant="body2"
                fontWeight="medium"
                color={positionSide === "LONG" ? "success.main" : "error.main"}
              >
                {positionSide}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("tradingAccount.tpsl.quantity")}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {currentQuantity}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("tradingAccount.tpsl.entryPrice")}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                ${entryPrice.toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("tradingAccount.tpsl.markPrice")}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                ${markPrice.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* TP/SL Type Toggle */}
        <Box sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={tpslType}
            exclusive
            onChange={(_, value) => value && setTpslType(value)}
            fullWidth
          >
            <ToggleButton value="TAKE_PROFIT" color="success">
              {t("tradingAccount.tpsl.takeProfit")}
            </ToggleButton>
            <ToggleButton value="STOP_LOSS" color="error">
              {t("tradingAccount.tpsl.stopLoss")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Stop Price */}
        <Box sx={{ mb: 2 }}>
          <TextField
            label={t("tradingAccount.tpsl.stopPrice")}
            type="number"
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              },
            }}
          />
          <Button
            size="small"
            onClick={handleUseSuggestedPrice}
            sx={{ mt: 0.5 }}
          >
            {t("tradingAccount.tpsl.useSuggested")}: $
            {getSuggestedPrice().toFixed(2)}
          </Button>
        </Box>

        {/* Quantity */}
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>{t("tradingAccount.tpsl.quantityOption")}</InputLabel>
            <Select
              value={useFullQuantity ? "full" : "partial"}
              label={t("tradingAccount.tpsl.quantityOption")}
              onChange={(e) => setUseFullQuantity(e.target.value === "full")}
            >
              <MenuItem value="full">
                {t("tradingAccount.tpsl.fullPosition")}
              </MenuItem>
              <MenuItem value="partial">
                {t("tradingAccount.tpsl.partialPosition")}
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {!useFullQuantity && (
          <Box sx={{ mb: 2 }}>
            <TextField
              label={t("tradingAccount.tpsl.quantity")}
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              fullWidth
              helperText={`${t("tradingAccount.tpsl.max")}: ${currentQuantity}`}
            />
          </Box>
        )}

        {/* Working Type */}
        <FormControl fullWidth>
          <InputLabel>{t("tradingAccount.tpsl.workingType")}</InputLabel>
          <Select
            value={workingType}
            label={t("tradingAccount.tpsl.workingType")}
            onChange={(e) =>
              setWorkingType(e.target.value as WorkingTypeOption)
            }
          >
            <MenuItem value="CONTRACT_PRICE">
              {t("tradingAccount.tpsl.contractPrice")}
            </MenuItem>
            <MenuItem value="MARK_PRICE">
              {t("tradingAccount.tpsl.markPriceOption")}
            </MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          color={tpslType === "TAKE_PROFIT" ? "success" : "error"}
          onClick={handleSubmit}
          disabled={isSubmitting || !stopPrice}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
        >
          {tpslType === "TAKE_PROFIT"
            ? t("tradingAccount.tpsl.placeTakeProfit")
            : t("tradingAccount.tpsl.placeStopLoss")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(TPSLDialog);
