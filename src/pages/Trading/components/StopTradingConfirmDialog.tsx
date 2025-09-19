import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { PositionSummary } from '@/types/trading.types';
import * as tradingAccountService from '@services/tradingAccount.service';
import { areEqual } from '@/utils/common';

interface StopTradingConfirmDialogProps {
  open: boolean;
  processName?: string;
  accountId?: string | null;
  symbol?: string | null;
  onClose: () => void;
  onStop: (clearPositions: boolean) => Promise<void> | void;
}

const formatNumber = (value?: number | null, maximumFractionDigits: number = 4) => {
  if (value === undefined || value === null || Number.isNaN(value)) return '-';
  return value.toLocaleString('en-US', {
    maximumFractionDigits,
  });
};

const StopTradingConfirmDialog: React.FC<StopTradingConfirmDialogProps> = ({
  open,
  processName,
  accountId,
  symbol,
  onClose,
  onStop,
}) => {
  const [positions, setPositions] = useState<PositionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPositions([]);
      setError(null);
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }

    if (!accountId) {
      setPositions([]);
      setError(null);
      return;
    }

    const fetchPositions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await tradingAccountService.getPositions(accountId, symbol ?? undefined);
        setPositions(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : 'Không thể tải danh sách lệnh đang chạy';
        setError(message);
        setPositions([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPositions();
  }, [open, accountId, symbol]);

  const handleStop = useCallback(async (clearPositions: boolean) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onStop(clearPositions);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, onStop]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 1.5,
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h6">Xác nhận dừng giao dịch</Typography>
          {processName && (
            <Typography variant="caption" color="text.secondary">
              {processName}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ p: 0.5 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, px: 3, pb: 1 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body1" fontWeight={500} gutterBottom>
              Bạn có chắc chắn muốn dừng trading process này?
            </Typography>
            {symbol && (
              <Typography variant="body2" color="text.secondary">
                Symbol: {symbol}
              </Typography>
            )}
          </Box>

          {accountId ? (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Các lệnh đang chạy
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {error}
                </Alert>
              )}

              {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                  <CircularProgress size={24} />
                </Box>
              ) : positions.length > 0 ? (
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    maxHeight: 240,
                    overflowY: 'auto',
                  }}
                >
                  {positions.map((position, index) => (
                    <React.Fragment key={`${position.order_id}-${index}`}>
                      <Box px={2} py={1.5}>
                        <Typography variant="body2" fontWeight={600}>
                          {position.symbol} · {position.side}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Khối lượng: {formatNumber(position.quantity)} · Entry: {formatNumber(position.entry_price)} · PnL: {formatNumber(position.unrealized_pnl, 2)}
                        </Typography>
                        {position.position_side && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Position side: {position.position_side}
                          </Typography>
                        )}
                      </Box>
                      {index < positions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có lệnh nào đang chạy cho tài khoản này.
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Không xác định được tài khoản trading để hiển thị các lệnh đang chạy.
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={isSubmitting}>
          Hủy
        </Button>
        <Button
          onClick={() => handleStop(false)}
          variant="contained"
          color="warning"
          disabled={isSubmitting}
        >
          Dừng
        </Button>
        <Button
          onClick={() => handleStop(true)}
          variant="contained"
          color="error"
          disabled={isSubmitting}
        >
          Dừng và đóng tất cả lệnh
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(StopTradingConfirmDialog, areEqual);
