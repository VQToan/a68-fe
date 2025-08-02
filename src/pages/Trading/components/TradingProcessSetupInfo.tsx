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

interface TradingProcessSetupInfoProps {
  open: boolean;
  onClose: () => void;
  setupData?: {
    SYMBOL?: string;
    INTERVAL_1?: string;
    INTERVAL_2?: string;
    TRADE_MODE?: number;
    ENTRY_PERCENTAGE?: number;
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
  // Get trade mode display text
  const getTradeModeText = (mode?: number) => {
    switch (mode) {
      case -1:
        return "SHORT ONLY";
      case 0:
        return "BOTH";
      case 1:
        return "LONG ONLY";
      default:
        return "N/A";
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Thông tin Setup Trading Process</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Basic Trading Setup */}
          <Typography variant="h6" gutterBottom color="primary">
            Cấu hình Cơ bản
          </Typography>
          <Box sx={{ ml: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Symbol:</strong> {setupData?.SYMBOL?.toUpperCase() || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Interval 1:</strong> {setupData?.INTERVAL_1 || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Interval 2:</strong> {setupData?.INTERVAL_2 || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Trade Mode:</strong> {getTradeModeText(setupData?.TRADE_MODE)}
            </Typography>
          </Box>

          {/* Trading Parameters */}
          <Typography variant="h6" gutterBottom color="primary">
            Thông số Trading
          </Typography>
          <Box sx={{ ml: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Entry Percentage:</strong> {setupData?.ENTRY_PERCENTAGE ? `${setupData.ENTRY_PERCENTAGE}%` : "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Leverage:</strong> {setupData?.LEVERAGE ? `${setupData.LEVERAGE}x` : "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Funds:</strong> ${setupData?.FUNDS || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Min ROI:</strong> {setupData?.MIN_ROI ? `${setupData.MIN_ROI}%` : "N/A"}
            </Typography>
          </Box>

          {/* Risk Management */}
          <Typography variant="h6" gutterBottom color="primary">
            Quản lý Rủi ro
          </Typography>
          <Box sx={{ ml: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Risk/Reward:</strong> {setupData?.R2R || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Max Loss:</strong> {setupData?.MAX_LOSS ? `$${setupData.MAX_LOSS}` : "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Max Margin %:</strong> {setupData?.MAX_MARGIN_PERCENTAGE ? `${setupData.MAX_MARGIN_PERCENTAGE}%` : "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Min Margin:</strong> ${setupData?.MIN_MARGIN || "N/A"}
            </Typography>
          </Box>

          {/* Technical Indicators */}
          <Typography variant="h6" gutterBottom color="primary">
            Chỉ báo Kỹ thuật
          </Typography>
          <Box sx={{ ml: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>MA Period:</strong> {setupData?.MA_PERIOD || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>RSI Long Entry:</strong> {setupData?.RSI_ENTRY_LONG || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>RSI Long Exit:</strong> {setupData?.RSI_EXIT_LONG || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>RSI Short Entry:</strong> {setupData?.RSI_ENTRY_SHORT || "N/A"}
            </Typography>
          </Box>

          {/* DCA Settings */}
          <Typography variant="h6" gutterBottom color="primary">
            Cài đặt DCA
          </Typography>
          <Box sx={{ ml: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>DCA Grid:</strong> {setupData?.DCA_GRID || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>DCA Multiplier:</strong> {setupData?.DCA_MULTIPLIER || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Time Between Orders:</strong> {setupData?.TIME_BETWEEN_ORDERS ? `${setupData.TIME_BETWEEN_ORDERS}s` : "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Pause Time:</strong> {setupData?.PAUSE_TIME || "N/A"}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(TradingProcessSetupInfo, areEqual);
