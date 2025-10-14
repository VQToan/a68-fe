import { memo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { areEqual } from "@/utils/common";
import { useTranslation } from "react-i18next";

interface TradingProcessSetupInfoProps {
  open: boolean;
  onClose: () => void;
  setupData?: {
    SYMBOL?: string;
    INTERVAL_1?: string;
    INTERVAL_2?: string;
    TRADE_MODE?: number;
    ENTRY_PERCENTAGE?: number;
    TRAILING_PERCENTAGE?: number;
    CALLBACK_PERCENTAGE?: number;
    LEVERAGE?: number;
    FUNDS?: number;
    MIN_ROI?: number;
    R2R?: string;
    MA_PERIOD?: string;
    RSI_ENTRY_LONG?: number;
    RSI_EXIT_LONG?: number;
    RSI_ENTRY_SHORT?: number;
    RSI_EXIT_SHORT?: number;
    DCA_GRID?: number;
    DCA_MULTIPLIER?: number;
    TIME_BETWEEN_ORDERS?: number;
    PAUSE_TIME?: string;
    MAX_LOSS?: number;
    MIN_MARGIN?: number;
    MAX_MARGIN_PERCENTAGE?: number;
  };
}

const TradingProcessSetupInfo = ({ 
  open, 
  onClose, 
  setupData 
}: TradingProcessSetupInfoProps) => {
  const { t } = useTranslation();
  // Get trade mode display text
  const getTradeModeText = (mode?: number) => {
    switch (mode) {
      case -1:
        return t("trading.form.tradeModes.shortOnly");
      case 0:
        return t("trading.form.tradeModes.both");
      case 1:
        return t("trading.form.tradeModes.longOnly");
      default:
        return t("common.notAvailable");
    }
  };

  const formatValue = (value?: number | string | null, suffix?: string, transform?: (v: string) => string) => {
    if (value === undefined || value === null || value === "") {
      return t("common.notAvailable");
    }
    const displayValue = transform ? transform(String(value)) : String(value);
    return suffix ? `${displayValue}${suffix}` : displayValue;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{t("trading.setupInfo.title")}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Basic Trading Setup */}
          <Typography variant="h6" gutterBottom color="primary">
            {t("trading.setupInfo.sections.basic")}
          </Typography>
          <Box sx={{ ml: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.symbol")}:</strong> {formatValue(setupData?.SYMBOL?.toUpperCase())}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.interval1")}:</strong> {formatValue(setupData?.INTERVAL_1)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.interval2")}:</strong> {formatValue(setupData?.INTERVAL_2)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.tradeMode")}:</strong> {getTradeModeText(setupData?.TRADE_MODE)}
            </Typography>
          </Box>

          {/* Trading Parameters */}
          <Typography variant="h6" gutterBottom color="primary">
            {t("trading.setupInfo.sections.trading")}
          </Typography>
          <Box sx={{ ml: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.entryPercentage")}:</strong> {formatValue(setupData?.ENTRY_PERCENTAGE, '%')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.trailingPercentage")}:</strong> {formatValue(setupData?.TRAILING_PERCENTAGE, '%')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.callbackPercentage")}:</strong> {formatValue(setupData?.CALLBACK_PERCENTAGE, '%')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.leverage")}:</strong> {formatValue(setupData?.LEVERAGE, 'x')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.funds")}:</strong> {formatValue(setupData?.FUNDS, '', (v) => `$${v}`)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.minRoi")}:</strong> {formatValue(setupData?.MIN_ROI, '%')}
            </Typography>
          </Box>

          {/* Risk Management */}
          <Typography variant="h6" gutterBottom color="primary">
            {t("trading.setupInfo.sections.risk")}
          </Typography>
          <Box sx={{ ml: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.riskToReward")}:</strong> {formatValue(setupData?.R2R)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.maxLoss")}:</strong> {formatValue(setupData?.MAX_LOSS, '', (v) => `$${v}`)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.maxMarginPercentage")}:</strong> {formatValue(setupData?.MAX_MARGIN_PERCENTAGE, '%')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.minMargin")}:</strong> {formatValue(setupData?.MIN_MARGIN, '', (v) => `$${v}`)}
            </Typography>
          </Box>

          {/* Technical Indicators */}
          <Typography variant="h6" gutterBottom color="primary">
            {t("trading.setupInfo.sections.indicators")}
          </Typography>
          <Box sx={{ ml: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.maPeriod")}:</strong> {formatValue(setupData?.MA_PERIOD)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.rsiEntryLong")}:</strong> {formatValue(setupData?.RSI_ENTRY_LONG)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.rsiExitLong")}:</strong> {formatValue(setupData?.RSI_EXIT_LONG)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.rsiEntryShort")}:</strong> {formatValue(setupData?.RSI_ENTRY_SHORT)}
            </Typography>
          </Box>

          {/* DCA Settings */}
          <Typography variant="h6" gutterBottom color="primary">
            {t("trading.setupInfo.sections.dca")}
          </Typography>
          <Box sx={{ ml: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.dcaGrid")}:</strong> {formatValue(setupData?.DCA_GRID)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.dcaMultiplier")}:</strong> {formatValue(setupData?.DCA_MULTIPLIER)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.timeBetweenOrders")}:</strong> {formatValue(setupData?.TIME_BETWEEN_ORDERS, ` ${t("trading.form.units.seconds")}`)}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>{t("trading.form.fields.pauseTime")}:</strong> {formatValue(setupData?.PAUSE_TIME)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          {t("common.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(TradingProcessSetupInfo, areEqual);
